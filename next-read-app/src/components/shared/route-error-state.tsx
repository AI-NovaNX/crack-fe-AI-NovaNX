"use client";

import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { useToast } from "@/components/providers/app-feedback-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RouteErrorState({
  title = "Halaman belum dapat dimuat",
  reset,
}: {
  title?: string;
  reset: () => void;
}) {
  const toast = useToast();

  useEffect(() => {
    toast({
      title,
      description: "Koneksi ke layanan sedang terganggu. Silakan coba kembali.",
      variant: "error",
    });
  }, [title, toast]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 font-outfit text-palette-slate-50">
      <div role="alert" className="max-w-lg text-center">
        <TriangleAlert
          className="mx-auto size-12 text-amber-300"
          aria-hidden="true"
        />
        <h1 className="pt-5 text-2xl font-extrabold">{title}</h1>
        <p className="pt-3 leading-7 text-palette-slate-400">
          Koneksi ke layanan sedang terganggu atau permintaan belum dapat
          diproses. Anda dapat mencoba lagi tanpa kehilangan halaman ini.
        </p>
        <div className="flex justify-center gap-3 pt-6">
          <Button type="button" onClick={reset} className="gap-2 rounded-full">
            <RefreshCw className="size-4" aria-hidden="true" />
            Coba lagi
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-full",
            )}
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
