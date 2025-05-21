"use client";

import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";
import ThemeProvider from "./provider";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { UserProvider } from "@/context/UserContext";
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

// export const metadata: Metadata = {
//   title: "Dev Deck",
//   description: "A Dev Deck built with Liveblocks and Next.js",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful:', registration);
          })
          .catch((err) => {
            console.log('ServiceWorker registration failed:', err);
          });
      });
    }
  }, []);

  return (
    <html lang="en">
      <body className={`${workSans.className} bg-dark`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider>
              <Room>{children}</Room>
            </UserProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
