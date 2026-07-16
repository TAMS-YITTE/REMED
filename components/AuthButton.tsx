'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AuthButton() {
  const { ready, authenticated, user, walletAddress, login, logout } = useAuth();
  const pathname = usePathname();

  if (!ready) return null;

  if (authenticated) {
    return (
      <div className="flex items-center gap-4">
        {pathname !== '/portefeuille' && (
          <Link href="/portefeuille" className="text-[14px] font-medium text-[#534AB7] hover:underline">
            Mon Portefeuille
          </Link>
        )}
        <button 
          onClick={logout}
          className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="bg-[#534AB7] text-white px-5 py-2.5 rounded-lg text-[14px] font-medium hover:opacity-90 transition-opacity"
    >
      Créer mon compte
    </button>
  );
}
