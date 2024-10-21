"use client";

import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        <NextUIProvider>
          {children}
        </NextUIProvider>
      </body>
    </html>
  );
}
