import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/pages/navbar";
import BubblesBackground from "@/components/backgrounds/bubbles-background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social V",
  description: "SocialV is a gamer social network",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <BubblesBackground />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
