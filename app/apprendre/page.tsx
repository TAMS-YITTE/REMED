'use client';

import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';
import { articles } from '@/lib/articles';

export default function ApprendrePage() {
  return (
    <main className="bg-gray-50 min-h-screen text-gray-900 flex flex-col">
      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-200/50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 no-underline">
            rem<span className="text-[#534AB7]">e</span>dly
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Accueil</Link>
            <Link href="/apprendre" className="text-sm font-medium text-[#534AB7]">Apprendre</Link>
            <Link href="/acheter" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Acheter</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-[#EEEDFE] text-[#3C3489] text-xs font-medium px-3.5 py-1 rounded-full mb-4 tracking-wide">
            Académie Remedly
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Comprendre la crypto,<br/>sans prise de tête
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Des guides simples, pensés pour les débutants, afin de vous accompagner dans vos premiers pas dans l'écosystème Web3.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
            >
              <Link href={`/apprendre/${article.slug}`} className="block group">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-indigo-300 hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {article.readTime} de lecture
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#534AB7] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">
                    {article.excerpt}
                  </p>
                  <div className="mt-6 flex items-center text-[#534AB7] text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Lire l'article →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
