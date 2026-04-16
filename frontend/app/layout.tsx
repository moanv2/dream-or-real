import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShellNav } from "@/components/AppShellNav";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dream or Real",
  description: "Guess whether each bizarre story is a dream or a real event.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <AppShellNav />
          <div className="pb-8">{children}</div>
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
