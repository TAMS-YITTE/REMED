import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Remedly',
  description: 'Politique de confidentialité et gestion de vos données personnelles sur Remedly.',
};

export default function ConfidentialiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
