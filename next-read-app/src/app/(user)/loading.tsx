export default function Loading() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-label="Loading NexRead content"
      className="mx-auto min-h-screen w-full max-w-[1160px] animate-pulse px-5 pt-7 pb-10 sm:px-8"
    >
      <div className="h-24 rounded-[32px] bg-secondary" />
      <div className="mt-10 h-9 w-64 rounded-xl bg-secondary" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[360px] rounded-[28px] bg-secondary" />
        ))}
      </div>
      <span className="sr-only">Loading data, please wait.</span>
    </main>
  );
}
