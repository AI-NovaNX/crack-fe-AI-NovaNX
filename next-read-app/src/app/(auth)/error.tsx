"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function AuthError({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState title="Layanan akun sedang terganggu" reset={reset} />
  );
}
