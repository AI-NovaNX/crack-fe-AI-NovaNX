"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { useToast } from "@/components/providers/app-feedback-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CatalogUnavailableProps = {
  title: string;
  message?: string;
  className?: string;
  onRetry?: () => void;
};

export function CatalogUnavailable({
  title,
  message = "We couldn't refresh the data. Check your connection or try again shortly.",
  className = "",
  onRetry,
}: CatalogUnavailableProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    toast({ title, description: message, variant: "error" });
  }, [message, title, toast]);

  return (
    <Card
      className={`rounded-[28px] border border-palette-indigo-300-20 bg-gray-200 p-0 py-0 text-palette-slate-50 shadow-none ring-0 ${className}`}
    >
      <CardContent className="flex min-h-44 flex-col items-center justify-center px-6 py-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-palette-cyan-300-10 text-skyblue">
          <WifiOff className="size-5" aria-hidden="true" />
        </span>
        <h2 className="pt-4 text-lg font-extrabold">{title}</h2>
        <p className="max-w-md pt-2 text-sm leading-6 text-palette-slate-400">
          {message}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              if (onRetry) onRetry();
              else router.refresh();
            })
          }
          className="mt-5 gap-2 rounded-full"
        >
          <RefreshCw
            className={`size-4 ${isPending ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {isPending ? "Retrying..." : "Try again"}
        </Button>
      </CardContent>
    </Card>
  );
}
