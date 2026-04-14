import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dream or Real",
  description: "Guess whether each bizarre story is a dream or a real event.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
