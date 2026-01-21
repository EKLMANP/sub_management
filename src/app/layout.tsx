import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { zhTW } from "@clerk/localizations";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SubsManager | 企業訂閱管理系統",
  description: "追蹤、管理和分析您的企業訂閱服務",
  keywords: ["訂閱管理", "SaaS", "企業軟體", "subscription management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={zhTW}>
      <html lang="zh-TW">
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
