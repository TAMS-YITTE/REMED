'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, Language, Currency } from '@/contexts/LanguageContext';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, currency, setCurrency, t } = useLanguage();

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
                {t('slogan')}
              </span>
            </div>
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.home')}</Link>
            <Link href="/acheter" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.buy')}</Link>
            <Link href="/rapport-fiscal" className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors">{t('nav.fiscal')}</Link>
            <Link href="/pro" className="text-sm font-semibold text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
              <span>{t('nav.pro')}</span>
              <span className="text-xs">⚡</span>
            </Link>
            <Link href="/apprendre" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{t('nav.blog')}</Link>
            <Link href="/apprendre/quiz" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">{t('nav.quiz')}</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Language + Currency Toggle */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#2E3152] rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === 'fr'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-[#2E3152] rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                currency === 'EUR'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              €
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                currency === 'USD'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              $
            </button>
          </div>
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
              <span className="text-lg font-bold text-white">{t('menu.title')}</span>
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
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/rapport-fiscal" className="px-4 py-4 text-base font-medium text-indigo-300 hover:text-indigo-200 hover:bg-white/5 rounded-xl transition-colors">{t('nav.fiscal')}</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/pro" className="px-4 py-4 text-base font-semibold text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 rounded-xl transition-colors flex items-center justify-between">
                <span>{t('nav.pro')} ⚡</span>
                <span className="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full text-purple-200">{t('pro.price')}</span>
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/apprendre" className="px-4 py-4 text-base font-medium text-gray-200 hover:text-white hover:bg-white/5 rounded-xl transition-colors">{t('nav.blog')}</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/apprendre/quiz" className="px-4 py-4 text-base font-medium text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl transition-colors">{t('nav.quiz')}</Link>
              
              {/* Mobile Language + Currency */}
              <div className="border-t border-white/10 pt-4 mt-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Langue · Language</span>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setLanguage('fr')} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${language === 'fr' ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-white/20 text-gray-400 hover:text-white'}`}>🇫🇷 Français</button>
                  <button onClick={() => setLanguage('en')} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${language === 'en' ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-white/20 text-gray-400 hover:text-white'}`}>🇬🇧 English</button>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Devise · Currency</span>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setCurrency('EUR')} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${currency === 'EUR' ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/20 text-gray-400 hover:text-white'}`}>€ EUR</button>
                  <button onClick={() => setCurrency('USD')} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${currency === 'USD' ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/20 text-gray-400 hover:text-white'}`}>$ USD</button>
                </div>
              </div>
              
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
