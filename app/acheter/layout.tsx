import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acheter des cryptomonnaies | Remedly',
  description: 'Achète Bitcoin, Ethereum, USDC, et bien plus encore en toute simplicité et sécurité par carte bancaire ou virement.',
};

export default function AcheterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
