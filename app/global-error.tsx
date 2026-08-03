"use client";

import { Button } from "@/components/ui/button";
import { Outfit } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in root layout:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <div className="fixed inset-0 z-[-1] bg-grid-white/[0.02] bg-size-[50px_50px]" />
        <div className="fixed inset-0 z-[-1] flex items-center justify-center">
          <div className="w-[60vw] h-[60vw] max-w-200 max-h-200  rounded-full blur-[120px] opacity-50" />
        </div>
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-lg space-y-6 relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
              Something went wrong.
            </h1>
            <p className="text-muted-foreground">
              {error.digest
                ? `An unexpected error occurred (ref: ${error.digest}).`
                : "An unexpected error occurred."}
            </p>
            <Button onClick={() => unstable_retry()}>Try again</Button>
          </div>
        </main>
      </body>
    </html>
  );
}
