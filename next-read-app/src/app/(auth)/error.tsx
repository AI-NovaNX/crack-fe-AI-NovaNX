"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function AuthError({ reset }: { reset: () => void }) {
  return <RouteErrorState title="Account service is disrupted" reset={reset} />;
}
