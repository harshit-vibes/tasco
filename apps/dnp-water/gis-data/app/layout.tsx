import "@tasco/ui/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GIS Data",
  description: "GIS Data - Tasco AI Challenge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
