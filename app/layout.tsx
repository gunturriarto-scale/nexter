import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-glow-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-glow-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "HERMES — Data Analyst",
  description: "GLOW FX TikTok commerce intelligence",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-[#f4f7fb] font-sans text-[#14213d]">
        <Sidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </body>
    </html>
  );
}
