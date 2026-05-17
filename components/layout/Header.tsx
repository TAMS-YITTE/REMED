"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, RefreshCw, User, Plus } from "lucide-react";

type Me = { prenom: string } | null;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me>(undefined as unknown as Me);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).then(setMe).catch(() => setMe(null));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-blue-950 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <RefreshCw className="w-5 h-5 text-cyan-400" />
          <span>Re<span className="text-cyan-400">Med</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/annonces" className="text-sm text-blue-200 hover:text-white transition-colors">Annonces</Link>
          <Link href="/deposer" className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5" /> Déposer une annonce
          </Link>
          {me ? (
            <Link href="/mon-compte" className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              <User className="w-4 h-4 text-cyan-400" /> {me.prenom}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/connexion" className="text-sm text-blue-200 hover:text-white transition-colors">Se connecter</Link>
              <Link href="/deposer" className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors">
                Vendre mon matériel
              </Link>
            </div>
          )}
        </nav>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-blue-900 border-t border-blue-800 px-4 py-4 flex flex-col gap-4">
          <Link href="/annonces" className="text-sm text-blue-200 hover:text-white" onClick={() => setOpen(false)}>Annonces</Link>
          {me ? (
            <Link href="/mon-compte" className="flex items-center gap-2 text-sm text-blue-200" onClick={() => setOpen(false)}>
              <User className="w-4 h-4 text-cyan-400" /> Mon compte ({me.prenom})
            </Link>
          ) : (
            <Link href="/connexion" className="text-sm text-blue-200 hover:text-white" onClick={() => setOpen(false)}>Se connecter</Link>
          )}
          <Link href="/deposer" className="bg-cyan-600 text-white text-sm px-4 py-2.5 rounded-lg text-center font-semibold" onClick={() => setOpen(false)}>
            Vendre mon matériel
          </Link>
        </div>
      )}
    </header>
  );
}
