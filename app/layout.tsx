import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const baseUrl = process.env.NODE_ENV === "production"
  ? "https://hsms.replit.app"
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Home Schooling Made Simple — Organize Your Homeschool",
  description:
    "One calm, organized place to assign work, track progress, and generate reports. Built for homeschooling families.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Home Schooling Made Simple — Organize Your Homeschool",
    description:
      "One calm, organized place to assign work, track progress, and generate reports. Built for homeschooling families.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Schooling Made Simple — Organize Your Homeschool",
    description:
      "One calm, organized place to assign work, track progress, and generate reports. Built for homeschooling families.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${plusJakarta.variable} antialiased`}>
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
