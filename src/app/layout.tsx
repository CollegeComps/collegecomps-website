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
  title: {
    default: 'CollegeComps - College ROI Calculator & Comparison Tool',
    template: '%s | CollegeComps',
  },
  description: 'Make smarter education decisions with our comprehensive college ROI calculator. Compare colleges, analyze costs, and predict graduate salaries based on real data.',
  keywords: ['college ROI', 'return on investment', 'college comparison', 'college costs', 'student debt', 'graduate salary', 'college worth', 'education ROI'],
  authors: [{ name: 'CollegeComps' }],
  creator: 'CollegeComps',
  publisher: 'CollegeComps',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://collegecomps.com',
    siteName: 'CollegeComps',
    title: 'CollegeComps - College ROI Calculator & Comparison Tool',
    description: 'Make smarter education decisions with our comprehensive college ROI calculator. Compare colleges, analyze costs, and predict graduate salaries based on real data.',
    images: [
      {
        url: 'https://collegecomps.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CollegeComps - College ROI Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollegeComps - College ROI Calculator & Comparison Tool',
    description: 'Make smarter education decisions with our comprehensive college ROI calculator.',
    images: ['https://collegecomps.com/og-image.png'],
    creator: '@collegecomps',
  },
  alternates: {
    canonical: 'https://collegecomps.com',
  },
  other: {
    'application-name': 'CollegeComps',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'CollegeComps',
  },
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
