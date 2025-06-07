import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ClientLayout } from "@/lib/ClientLayout";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "DevDeck - Collaborative Developer Platform",
  description: "A unified workspace for designers and developers with real-time collaboration",
  keywords: ["collaboration", "design", "development", "whiteboard", "presentation"],
  authors: [{ name: "DevDeck Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#00fff7",
          colorBackground: "#000000",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600",
          card: "bg-gray-900 border border-gray-700",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-300",
          formFieldLabel: "text-white",
          formFieldInput: "bg-gray-800 border-gray-600 text-white",
          footerActionLink: "text-cyan-400 hover:text-cyan-300",
        },
      }}
    >
      <html lang="en">
        <body className={`${workSans.className} bg-black text-white`}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
