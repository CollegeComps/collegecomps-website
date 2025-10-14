import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SessionProvider from "@/components/SessionProvider";
import OnboardingCheck from "@/components/OnboardingCheck";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollegeComps - College Data Analysis & ROI Calculator",
  description: "Comprehensive college data analysis platform with ROI calculator, program analysis, and institutional comparisons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <OnboardingCheck>
            <Sidebar>
              {children}
            </Sidebar>
          </OnboardingCheck>
          <CookieConsent />
        </SessionProvider>
      </body>
    </html>
  );
}
