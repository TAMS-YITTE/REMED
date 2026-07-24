import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.remedly.fr'),
  alternates: {
    canonical: '/',
  },
  title: "Remedly — La crypto, simplement.",
  description: "Achetez Bitcoin, Ethereum, Solana et plus encore en quelques minutes. Sans jargon, sans prise de tête. La plateforme idéale pour débuter en cryptomonnaies.",
  keywords: ["crypto", "acheter bitcoin", "ethereum", "portefeuille crypto", "débutant", "achat crypto france"],
  openGraph: {
    title: "Remedly — La crypto, simplement.",
    description: "Achetez Bitcoin, Ethereum et plus encore en quelques minutes. Sans jargon, sans prise de tête.",
    url: "https://remedly.fr",
    siteName: "Remedly",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remedly — La crypto, simplement.",
    description: "Achetez vos premières cryptos en quelques clics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col bg-white text-gray-900`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
