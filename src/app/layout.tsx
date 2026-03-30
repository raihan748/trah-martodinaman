import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Portal Trah Martodinaman",
  description: "Portal Keluarga Besar Trah Martodinaman — Menjaga Silaturahmi, Merawat Warisan",
  keywords: ["trah", "martodinaman", "keluarga", "silsilah", "portal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={outfit.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="min-h-screen bg-krem antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
