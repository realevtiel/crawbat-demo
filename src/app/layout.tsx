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

export const metadata: Metadata = {
  title: "Crawbat Demo",
  description: "Crawbat chat widget demo",
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

          {/* <Script
          id="crawbat-chat-widget"
          src="https://widget.crawbat.com/chat-widget.js"
          strategy="afterInteractive"
          data-client-id="acme"
          data-widget-key="pub_acme_test_123"
          data-api-url="https://api.crawbat.com/chat"
          data-widget-config-url="https://api.crawbat.com/widget-config"

          data-position="center" 
          data-show-badge="true"
          data-request-timeout="12000"
        /> */}

      </body>
    </html>
  );
}
