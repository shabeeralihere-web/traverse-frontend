
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, League_Spartan, Outfit } from "next/font/google";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreProvider from "@/redux/storeProvider";

import "./globals.css";

// Global website font
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Brand logo font
const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-league-spartan",
  display: "swap",
});

// Homepage heading font
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
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
      <body
        className={`${dmSans.className} ${leagueSpartan.variable} ${outfit.variable} flex min-h-screen flex-col antialiased`}
      >
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
