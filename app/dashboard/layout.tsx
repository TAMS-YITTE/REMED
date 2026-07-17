import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Espace | Remedly',
  description: 'Retrouvez votre adresse de portefeuille et les informations de votre compte Remedly.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
