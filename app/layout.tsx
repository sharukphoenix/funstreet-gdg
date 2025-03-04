"use client";
import type { Metadata } from "next";
import { useEffect } from 'react';
import { Work_Sans } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { MyFirebaseProvider } from "@/components/firebase-providers";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

const font = Work_Sans({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {

  return (
    <html lang="en">
      <body className={cn(font.className)}>
        <MyFirebaseProvider>
          {children}
          <Toaster />
        </MyFirebaseProvider>
      </body>
    </html>
  );
}
