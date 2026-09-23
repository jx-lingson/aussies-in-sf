import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aussies in SF — Australians around the Bay",
  description: "Find Australians living in and visiting San Francisco, the Peninsula and the East Bay.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/kangaroo-icon.svg",
    shortcut: "/kangaroo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
