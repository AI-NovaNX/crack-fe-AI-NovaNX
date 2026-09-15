import type { Metadata } from "next";
import Script from "next/script";
import { Outfit } from "next/font/google";

import "./globals.css";
import { AppFeedbackProvider } from "@/components/providers/app-feedback-provider";
import type { RootLayoutProps } from "@/types/layout";
import { themeInitScript } from "@/lib/theme";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexRead",
    template: "%s | NexRead",
  },
  description: "Discover, reserve, and manage books with NexRead.",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Script id="nexread-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <AppFeedbackProvider>{children}</AppFeedbackProvider>
      </body>
    </html>
  );
}
