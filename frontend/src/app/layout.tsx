import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { brand } from "@/lib/brand";
import { themeInitScript } from "@/lib/theme";
import { Providers } from "./providers";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  // 공유 미리보기 이미지(og:image)는 절대 주소여야 한다. 배포할 때 SITE_URL(예: https://gotthis.example.com)을 빌드 환경변수로 넣는다.
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: brand.name,
  description: brand.description,
  openGraph: { title: brand.name, description: brand.tagline, siteName: brand.name, locale: "ko_KR", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
