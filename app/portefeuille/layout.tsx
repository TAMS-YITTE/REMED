import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Portefeuille Crypto | Remedly',
  description: 'Gérez vos cryptomonnaies en toute sécurité depuis votre portefeuille personnel non-hébergé.',
};

export default function PortefeuilleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
