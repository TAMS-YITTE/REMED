import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales | Remedly',
  description: 'Mentions légales et informations éditeur de la plateforme Remedly.',
};

export default function MentionsLegalesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
