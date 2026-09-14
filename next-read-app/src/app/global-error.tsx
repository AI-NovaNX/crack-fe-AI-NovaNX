"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="id" className="dark h-full">
      <body className="flex min-h-full items-center justify-center bg-card px-6 text-white">
        <main role="alert" className="max-w-lg text-center font-sans">
          <h1 className="text-2xl font-bold">
            NexRead belum dapat ditampilkan
          </h1>
          <p className="pt-3 leading-7 text-slate-400">
            Terjadi gangguan yang tidak terduga. Muat ulang aplikasi untuk
            melanjutkan.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Muat ulang aplikasi
          </button>
        </main>
      </body>
    </html>
  );
}
