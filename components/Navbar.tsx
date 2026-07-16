'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-gray-200/50 sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tighter text-gray-900 no-underline">
            rem<span className="text-indigo-600">e</span>dly
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Accueil</Link>
            <Link href="/acheter" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Acheter</Link>
            <Link href="/apprendre" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Blog</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
            className="md:hidden fixed top-[69px] left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-40 p-4"
          >
            <div className="flex flex-col gap-4">
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-xl">Accueil</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/acheter" className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-xl">Acheter</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/apprendre" className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-xl">Blog</Link>
              <div className="mt-4 pt-4 border-t border-gray-100 px-4">
                <AuthButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
