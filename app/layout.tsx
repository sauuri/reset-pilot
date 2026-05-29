import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SkyBackground from "./components/SkyBackground";
import ScrollReset from "./components/ScrollReset";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResetPilot — 망한 하루 복구 AI",
  description: "오늘 망했어도 괜찮아. 지금 당장 가능한 것부터.",
};

// inline script: runs synchronously before React hydration to prevent white flash
const skyInitScript = `(function(){
  var h=new Date().getHours();
  var c=h>=5&&h<7?'#1a1a5e':h>=7&&h<17?'#3fa3d5':h>=17&&h<20?'#0a1530':'#010810';
  document.documentElement.style.background=c;
  document.body&&(document.body.style.background=c);
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: skyInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ScrollReset />
        <SkyBackground />
        {children}
      </body>
    </html>
  );
}
