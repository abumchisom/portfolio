import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joseph's Portfolio",
  description: "What I Build, Teach, and Protect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.className}>
      <body
      >
        <Suspense fallback={null}>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
