import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apprendre | Remedly',
  description: 'Guides, tutoriels et articles pour tout comprendre sur les cryptomonnaies, la blockchain et comment investir sereinement.',
};

export default function ApprendreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
