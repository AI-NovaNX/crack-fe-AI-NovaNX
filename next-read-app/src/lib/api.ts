import { env } from "@/lib/env";

export const API_BASE_URL = env.apiBaseUrl.replace(/\/$/, "");
export function createApiUrl(path: string) {
  if (!API_BASE_URL)
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const NETWORK_RETRY_DELAYS_MS = [250, 750] as const;
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const CATALOG_REVALIDATE_SECONDS = 60;

type ApiRequestOptions = {
  cacheCatalog?: boolean;
};

function isRetryableMethod(method: string | undefined) {
  return !method || method === "GET" || method === "HEAD";
}

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function fetchWithNetworkRetry(url: string, init: RequestInit) {
  const retryable = isRetryableMethod(init.method?.toUpperCase());
  const attempts = retryable ? NETWORK_RETRY_DELAYS_MS.length + 1 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(15000),
      });

      if (
        !retryable ||
        !RETRYABLE_STATUS_CODES.has(response.status) ||
        attempt === attempts - 1
      ) {
        return response;
      }

      await wait(NETWORK_RETRY_DELAYS_MS[attempt]);
    } catch (error) {
      const isLastAttempt = attempt === attempts - 1;

      if (isLastAttempt || init.signal?.aborted) {
        throw new ApiError(
          503,
          "Layanan NexRead sedang sulit dijangkau. Coba kembali sebentar lagi.",
        );
      }

      await wait(NETWORK_RETRY_DELAYS_MS[attempt]);
    }
  }

  throw new ApiError(503, "Layanan NexRead sedang sulit dijangkau.");
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body instanceof FormData) headers.delete("Content-Type");
  else if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetchWithNetworkRetry(createApiUrl(path), {
    ...init,
    headers,
    ...(options.cacheCatalog
      ? {
          cache: "force-cache",
          next: { revalidate: CATALOG_REVALIDATE_SECONDS },
        }
      : { cache: "no-store" }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(". ")
      : body?.message;
    throw new ApiError(
      response.status,
      typeof message === "string"
        ? message
        : `API request failed (${response.status}).`,
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
