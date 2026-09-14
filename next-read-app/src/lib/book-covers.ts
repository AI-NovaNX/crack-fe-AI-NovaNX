import { env } from "@/lib/env";

// Supported API cover styles must be present in source for Tailwind to generate them.
const coverStyles = new Set([
  "bg-[linear-gradient(135deg,_#ff637e,_#fb2c36_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#5ee9b5,_#009689_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#fee685,_#ff6900_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#a4f4cf,_#006045_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#cad5e2,_#1d293d_50%,_#000)]",
  "bg-[linear-gradient(135deg,_#ffb86a,_#f54900_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#c4b4ff,_#7008e7_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#53eafd,_#155dfc_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#86efac,_#16a34a_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#fde68a,_#ca8a04_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#93c5fd,_#2563eb_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#f0abfc,_#a21caf_50%,_#020618)]",
  "bg-[linear-gradient(135deg,_#4ddeff,_#7c5cff_50%,_#020618)]",
  "bg-gradient-to-br from-blue-500 to-indigo-700",
]);

export function getBookCoverClassName(
  value: string | null | undefined,
): string {
  return value && coverStyles.has(value)
    ? value
    : "bg-gradient-to-br from-blue-500 to-indigo-700";
}

export function getBookCoverUrl(
  value: string | null | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  if (/^https?:\/\//i.test(normalized)) return normalized;

  if (normalized.startsWith("/")) {
    const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
    return baseUrl ? `${baseUrl}${normalized}` : normalized;
  }

  return normalized;
}
