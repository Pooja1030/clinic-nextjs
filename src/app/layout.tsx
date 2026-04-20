// layout.tsx
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "../context/AuthContext"; // ✅ your AuthContext
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClinicPro",
  description: "Clinic Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/*  Wrap all children */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
