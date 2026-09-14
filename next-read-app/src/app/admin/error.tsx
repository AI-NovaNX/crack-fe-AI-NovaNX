"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState title="Halaman admin belum dapat dimuat" reset={reset} />
  );
}
