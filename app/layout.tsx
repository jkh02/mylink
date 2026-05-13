import { Geist, Geist_Mono, Noto_Sans } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/query-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://mylink-eosin.vercel.app"),
  title: {
    default: "MyLink - 모든 링크를, 하나의 페이지에",
    template: "%s | MyLink",
  },
  description: "인스타그램, 유튜브, 블로그, 쇼핑몰 — 흩어진 모든 링크를 한 곳에 모아 공유하세요. 크리에이터, 인플루언서, 브랜드를 위한 무료 멀티 링크 페이지 서비스.",
  keywords: ["링크인바이오", "멀티링크", "링크트리", "인스타그램 링크", "크리에이터", "인플루언서", "mylink", "link in bio"],
  authors: [{ name: "MyLink" }],
  creator: "MyLink",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "MyLink",
    title: "MyLink - 모든 링크를, 하나의 페이지에",
    description: "크리에이터, 인플루언서, 브랜드를 위한 무료 멀티 링크 페이지 서비스. 30초면 나만의 링크 페이지를 만들 수 있습니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLink - 모든 링크를, 하나의 페이지에",
    description: "크리에이터를 위한 무료 멀티 링크 페이지 서비스.",
  },
};

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", notoSans.variable)}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
