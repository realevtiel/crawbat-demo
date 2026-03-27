import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://demo.crawbat.com";

export const metadata: Metadata = {
  title: {
    default: "Crawbat — Cut Support Costs and Answer Customers Instantly",
    template: "%s | Crawbat",
  },
  description:
    "Handle up to 70% of customer questions automatically with accurate AI support. No hallucinations, faster responses, and real insights into customer demand to optimize support and unlock new revenue opportunities.",
  keywords: [
    "customer support automation",
    "reduce customer support workload",
    "cut support costs for business",
    "automate customer inquiries",
    "website chat for customer support",
    "after hours customer support automation",

    "AI chat for HVAC companies",
    "HVAC customer support automation",
    "AI chat for medical clinics",
    "clinic customer support automation",
    "AI chat for ecommerce store",
    "ecommerce customer support automation",
    "AI chat for local service businesses",

    "increase bookings with chat",
    "improve customer support conversion",
    "customer demand insights",
    "understand what customers want",
  ],
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Crawbat — Cut Support Costs and Answer Customers Instantly",
    description:
      "Handle up to 70% of customer questions automatically with accurate AI support. No hallucinations, faster responses, and real insights into customer demand to optimize support and unlock new revenue opportunities.",
    url: SITE_URL,
    siteName: "Crawbat",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Crawbat — Cut Support Costs and Answer Customers Instantly",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crawbat — Cut Support Costs and Answer Customers Instantly",
    description:
      "Handle up to 70% of customer questions automatically with accurate AI support. No hallucinations, faster responses, and real insights into customer demand to optimize support and unlock new revenue opportunities.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        {children}
      </body>
    </html>
  );
}
