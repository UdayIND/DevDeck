"use client";

import { ReactNode } from "react";
import { Room } from "./Room";
import ThemeProvider from "./provider";
import { Toaster } from "react-hot-toast";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Room>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
            success: {
              style: {
                border: '1px solid #00ff5a',
              },
            },
            error: {
              style: {
                border: '1px solid #ff4757',
              },
            },
          }}
        />
      </Room>
    </ThemeProvider>
  );
} 