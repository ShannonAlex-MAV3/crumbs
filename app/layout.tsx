import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import type { BaseUser } from "@/types/user";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Crumbs - Expense & Income Tracker",
  description: "Track expenses, incomes, and split with friends easily.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user: BaseUser | null = null;
  console.log("Token found in cookies, attempting to fetch user");
    try {
      const row = await fetch("/api/me", {
        headers: {
          "Content-Type": "application/json",
          'cookie': cookies()
        },
      })
        .then((res) => res.json())
        .catch(() => {
          throw new Error("Failed to fetch user");
        });

      if (row) {
        user = {
          email: row.email,
          name: row.name,
          picture: row.picture,
          provider: "google",
          providerUserId: "", // This should be fetched from the database if needed
        };
      }
    } catch (e) {
      console.warn("Invalid token, user not fetched", e);
    }

  return (
    <html lang="en" className="dark">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </head>
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <div className="fixed inset-0 z-[-1] bg-grid-white/[0.02] bg-size-[50px_50px]" />
        <div className="fixed inset-0 z-[-1] flex items-center justify-center">
          <div className="w-[60vw] h-[60vw] max-w-200 max-h-200 bg-primary/20 rounded-full blur-[120px] opacity-50" />
        </div>
        <AuthProvider initialUser={user}>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
