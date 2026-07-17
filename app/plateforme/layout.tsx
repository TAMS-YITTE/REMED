import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'La Plateforme | Remedly',
  description: 'Découvrez la plateforme Remedly, la solution la plus simple pour acheter et gérer vos cryptomonnaies en toute sécurité.',
};

export default function PlateformeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
