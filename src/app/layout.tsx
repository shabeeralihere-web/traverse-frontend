
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans } from "next/font/google";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreProvider from "@/redux/storeProvider";

import "./globals.css";

// Load DM Sans globally.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Traverse | Explore More",
  description:
    "Discover amazing tours, destinations and travel experiences with Traverse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} flex min-h-screen flex-col antialiased`}>
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
