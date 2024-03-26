import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IMPACT",
  description: "Impact UGC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return(
        <ClerkProvider>
            <html lang="en">
                <Navbar />
                <body>{children}</body>
            </html>
        </ClerkProvider>
  );
}
