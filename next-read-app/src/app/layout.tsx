import type { Metadata } from "next";

import "./globals.css";
import { AppFeedbackProvider } from "@/components/providers/app-feedback-provider";
import type { RootLayoutProps } from "@/types/layout";
import { themeInitScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: "NexRead",
    template: "%s | NexRead",
  },
  description: "Discover, reserve, and manage books with NexRead.",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body className="flex min-h-full flex-col">
        <AppFeedbackProvider>{children}</AppFeedbackProvider>
      </body>
    </html>
  );
}
