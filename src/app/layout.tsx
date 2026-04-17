import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/passive-events";
import Sidebar from "@/components/Sidebar";
import SessionProvider from "@/components/SessionProvider";
import OnboardingCheck from "@/components/OnboardingCheck";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://collegecomps.com'),
  title: {
    default: 'CollegeComps — Is Your Degree Really Worth the Debt?',
    template: '%s | CollegeComps',
  },
  description: 'Compare the ROI of 6,000+ US colleges, trade schools, and graduate programs using federal IPEDS data. See real tuition vs. earnings before you borrow.',
  keywords: [
    'college ROI calculator',
    'is college worth it',
    'trade school vs college',
    'college return on investment',
    'graduate salary by major',
    'student debt calculator',
    'compare colleges',
    'college tuition comparison',
    'best ROI colleges',
    'IPEDS data',
  ],
  authors: [{ name: 'CollegeComps' }],
  creator: 'CollegeComps',
  publisher: 'CollegeComps',
  applicationName: 'CollegeComps',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    // Next.js generates <link rel="canonical"> pointing at the current URL
    // on every page, inheriting from metadataBase.
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://collegecomps.com',
    siteName: 'CollegeComps',
    title: 'CollegeComps — Is Your Degree Really Worth the Debt?',
    description: 'Compare the ROI of 6,000+ US colleges, trade schools, and graduate programs using federal IPEDS data. See real tuition vs. earnings before you borrow.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'CollegeComps — College ROI Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CollegeComps — Is Your Degree Really Worth the Debt?',
    description: 'Compare the ROI of 6,000+ US colleges, trade schools, and graduate programs using federal IPEDS data.',
    images: ['/opengraph-image'],
    creator: '@collegecomps',
    site: '@collegecomps',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || 'EO0OEf4SRlUbvUooBY-Ym-u2w20gDBIxYjJFv6Ko_Tg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <SessionProvider>
          <OnboardingCheck>
            <Sidebar>
              {children}
            </Sidebar>
          </OnboardingCheck>
          <CookieConsent />
        </SessionProvider>
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
