import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idea Atlas — AI brainstorming clusters",
  description: "Find meaningful themes, overlaps, and outliers in your brainstorming ideas, then shape your own visual board.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
