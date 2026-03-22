import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WalkPick — 今天去哪散步？",
  description: "解除選擇障礙，隨機抽籤決定散步地點",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
