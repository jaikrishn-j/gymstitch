import type { Metadata } from "next";
import { Manrope, Gelasio, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { Footer } from "@/components/Footer";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

const fontSerif = Gelasio({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Gym Stitch",
  description: "Gym Management and Member Fitness Tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", manrope.variable, fontSerif.variable, fontMono.variable)}
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </ClerkProvider>
        </ThemeProvider>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}