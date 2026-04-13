import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// `metadataBase` è usato da Next per risolvere gli URL relativi in openGraph,
// twitter, alternates.canonical, ecc. Deriviamo dall'env per restare in sync
// tra preview Vercel, prod e dominio custom futuro.
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aifolly-menu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  // Nessun template: le pagine admin e del menu pubblico impostano titoli
  // espliciti (admin con proprio template, menu con nome del ristorante).
  title: {
    default: "AiFolly Menu — Menu digitali per ristoranti",
    template: "%s",
  },
  description:
    "Piattaforma per creare menu digitali personalizzati. I clienti del ristorante scansionano un QR code dal tavolo e visualizzano il menu sullo smartphone.",
  applicationName: "AiFolly Menu",
  openGraph: {
    siteName: "AiFolly Menu",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
