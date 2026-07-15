import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Portefeuille Crypto | Remedly',
  description: 'Gère tes cryptomonnaies en toute sécurité depuis ton portefeuille personnel non-hébergé.',
};

export default function PortefeuilleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
