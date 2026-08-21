import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AppProvider } from "@/lib/app-context";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lado — Russian for bilingual preschoolers",
  description:
    "Structured 20-minute live lessons and clear longitudinal progress for bilingual children ages 3–6.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f4f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <AppProvider>
          <div className="app-shell">
            <SiteHeader />
            <main>{children}</main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
