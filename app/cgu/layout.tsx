import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation | Remedly',
  description: 'Conditions générales d\'utilisation des services Remedly.',
};

export default function CguLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
