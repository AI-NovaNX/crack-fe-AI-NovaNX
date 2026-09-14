"use client";

import { useEffect } from "react";

import { useToast } from "@/components/providers/app-feedback-provider";

export function InlineErrorNotice({
  title,
  message,
  className = "",
}: {
  title: string;
  message: string;
  className?: string;
}) {
  const toast = useToast();

  useEffect(() => {
    toast({ title, description: message, variant: "error" });
  }, [message, title, toast]);

  return (
    <p role="alert" className={className}>
      {message}
    </p>
  );
}
