"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState title="The admin page could not be loaded" reset={reset} />
  );
}
