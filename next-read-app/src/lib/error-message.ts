type StatusError = {
  status?: number;
  message?: string;
};

export function getHttpErrorMessage(status: number, detail?: string) {
  switch (status) {
    case 400:
      return (
        detail || "The submitted data is invalid. Please check your input again."
      );
    case 401:
      return detail || "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return detail || "The data you are looking for was not found.";
    case 409:
      return detail || "That data is already in use or has a conflict.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 502:
    case 503:
    case 504:
      return "NexRead's service is having trouble responding. Please try again shortly.";
    default:
      return status >= 500
        ? "A server error occurred. Please try again shortly."
        : detail || "The request could not be processed. Please try again.";
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "The data could not be loaded. Please try again.",
) {
  if (error && typeof error === "object") {
    const { status, message } = error as StatusError;
    if (typeof status === "number") return getHttpErrorMessage(status, message);
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
