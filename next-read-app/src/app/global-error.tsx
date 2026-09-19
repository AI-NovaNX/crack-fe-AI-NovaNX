"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="flex min-h-full items-center justify-center bg-card px-6 text-white">
        <main role="alert" className="max-w-lg text-center font-sans">
          <h1 className="text-2xl font-bold">
            NexRead could not be displayed
          </h1>
          <p className="pt-3 leading-7 text-slate-400">
            An unexpected error occurred. Reload the app to continue.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Reload app
          </button>
        </main>
      </body>
    </html>
  );
}
