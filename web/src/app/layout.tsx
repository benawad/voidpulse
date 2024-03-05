import type { Metadata } from "next";
import "chart.js/auto";
import { Inter } from "next/font/google";
import "./css/globals.css";
import { trpc } from "./utils/trpc";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Voidpulse",
  description: "Copilot for your product",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
