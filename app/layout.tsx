import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReMed — Matériel médical d'occasion entre professionnels de santé",
  description: "Achetez et vendez du matériel médical d'occasion entre praticiens. Imagerie, dentisterie, kinésithérapie et plus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-blue-950 text-blue-400 text-xs text-center py-4 mt-auto">
          © {new Date().getFullYear()} ReMedly.fr — Marketplace de matériel médical d&apos;occasion entre professionnels
        </footer>
      </body>
    </html>
  );
}
