'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, Language } from '@/contexts/LanguageContext';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

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
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.home')}</Link>
            <Link href="/acheter" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.buy')}</Link>
            <Link href="/apprendre" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.blog')}</Link>
            <Link href="/apprendre/quiz" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">{t('nav.quiz')}</Link>
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

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#2E3152] border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <span className="text-lg font-bold text-white">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-2 p-6 overflow-y-auto flex-1">
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className="px-4 py-4 text-base font-medium text-gray-200 hover:text-white hover:bg-white/5 rounded-xl transition-colors">{t('nav.home')}</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/acheter" className="px-4 py-4 text-base font-medium text-gray-200 hover:text-white hover:bg-white/5 rounded-xl transition-colors">{t('nav.buy')}</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/apprendre" className="px-4 py-4 text-base font-medium text-gray-200 hover:text-white hover:bg-white/5 rounded-xl transition-colors">{t('nav.blog')}</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/apprendre/quiz" className="px-4 py-4 text-base font-medium text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl transition-colors">{t('nav.quiz')}</Link>
              <div className="mt-auto pt-6">
                <AuthButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
