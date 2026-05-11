import "./globals.css";
import SiteHeader from "./components/SiteHeader";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import Link from "next/link";

export const metadata = {
  title: "DevTools Hub",
  description: "Free online developer tools",
  verification: {
    google: "wgIDY5lFyDBXCWl7aHXAMjk6P2JIZxnGXiB6E4RLBGc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        {/* AdSense Script */}
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX"
          crossOrigin="anonymous"
        />

        {/* Header */}
        <SiteHeader />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t mt-10 py-6 text-sm text-gray-500 text-center">
          <div className="flex justify-center gap-6">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </div>

          <p className="mt-3">© {new Date().getFullYear()} DevTools Hub</p>
        </footer>

        {/* Analytics */}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
