import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DRisk Help Centre",
  description:
    "Guides and support for using the DRisk compliance platform.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="flex min-h-screen flex-col">
        {children}
      </body>
    </html>
  );
}