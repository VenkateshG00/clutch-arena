import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { PWARegister } from "@/components/pwa-register";
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
  title: {
    default: "Clutch Arena - Play Quick. Beat Everyone. Climb the Ranks.",
    template: "%s | Clutch Arena",
  },
  description:
    "Competitive casual gaming platform. Play quick mini-games, compete against global players, and climb the rankings.",
  keywords: [
    "gaming",
    "competitive",
    "mini-games",
    "leaderboard",
    "casual games",
    "multiplayer",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Clutch Arena",
  },
  icons: {
    apple: "/icons/icon-192x192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B5CF6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#090B14] text-[#F8FAFC]">
        {children}
        <PWARegister />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111525",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F8FAFC",
            },
          }}
        />
      </body>
    </html>
  );
}
