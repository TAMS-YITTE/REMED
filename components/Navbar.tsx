'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-white/10 sticky top-0 bg-[#252844]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <img src="/logo.png" alt="Remedly Logo" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
            <div className="flex flex-col justify-center">
              <span className="text-xl font-bold tracking-tighter text-white leading-none">
                rem<span className="text-indigo-400">e</span>dly
              </span>
              <span className="text-[10px] text-indigo-300/80 font-medium tracking-wider uppercase mt-1">
                Remède contre la complexité
              </span>
            </div>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Accueil</Link>
            <Link href="/acheter" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Acheter</Link>
            <Link href="/apprendre" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          <button 
            className="md:hidden p-2 text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-[69px] left-0 right-0 bg-[#252844] border-b border-white/10 shadow-xl z-40 p-4"
          >
            <div className="flex flex-col gap-4">
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className="block px-4 py-3 text-base font-medium text-white hover:bg-white/5 rounded-xl">Accueil</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/acheter" className="block px-4 py-3 text-base font-medium text-white hover:bg-white/5 rounded-xl">Acheter</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/apprendre" className="block px-4 py-3 text-base font-medium text-white hover:bg-white/5 rounded-xl">Blog</Link>
              <div className="mt-4 pt-4 border-t border-white/10 px-4">
                <AuthButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
