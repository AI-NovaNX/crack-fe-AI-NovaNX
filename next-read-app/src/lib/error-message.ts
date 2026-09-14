type StatusError = {
  status?: number;
  message?: string;
};

export function getHttpErrorMessage(status: number, detail?: string) {
  switch (status) {
    case 400:
      return (
        detail || "Data yang dikirim belum valid. Periksa kembali isian Anda."
      );
    case 401:
      return detail || "Sesi Anda telah berakhir. Silakan masuk kembali.";
    case 403:
      return "Anda tidak memiliki izin untuk melakukan tindakan ini.";
    case 404:
      return detail || "Data yang Anda cari tidak ditemukan.";
    case 409:
      return detail || "Data tersebut sudah digunakan atau mengalami konflik.";
    case 429:
      return "Terlalu banyak permintaan. Tunggu sebentar lalu coba kembali.";
    case 502:
    case 503:
    case 504:
      return "Layanan NexRead sedang sulit dijangkau. Coba kembali sebentar lagi.";
    default:
      return status >= 500
        ? "Terjadi gangguan pada server. Coba kembali sebentar lagi."
        : detail || "Permintaan belum dapat diproses. Silakan coba kembali.";
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Data belum dapat dimuat. Silakan coba kembali.",
) {
  if (error && typeof error === "object") {
    const { status, message } = error as StatusError;
    if (typeof status === "number") return getHttpErrorMessage(status, message);
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}
