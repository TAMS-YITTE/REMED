'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';

const questions = [
  {
    question: "Qu'est-ce qu'une phrase de récupération (seed phrase) ?",
    options: [
      "Un mot de passe oublié pour se connecter à la plateforme.",
      "La clé maître qui permet de restaurer votre portefeuille sur n'importe quel appareil.",
      "Une adresse publique pour recevoir des fonds."
    ],
    correctAnswer: 1
  },
  {
    question: "Où devez-vous stocker votre phrase de récupération ?",
    options: [
      "Sur un post-it collé à mon écran.",
      "Dans un fichier texte sur mon bureau d'ordinateur.",
      "Hors ligne, sur un papier gardé en sécurité dans un endroit sûr."
    ],
    correctAnswer: 2
  },
  {
    question: "Qui peut récupérer vos fonds si vous perdez votre phrase de récupération ?",
    options: [
      "Le service client de Remedly.",
      "La blockchain elle-même.",
      "Absolument personne, les fonds sont perdus à jamais."
    ],
    correctAnswer: 2
  }
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setTimeout(() => {
      if (index === questions[currentQuestion].correctAnswer) {
        setScore(score + 1);
      }
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
        // Si tout est juste, on pourrait sauvegarder la récompense dans le localStorage ou via l'API
        if (score + (index === questions[currentQuestion].correctAnswer ? 1 : 0) === questions.length) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('remedly_zero_fees_reward', 'true');
          }
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-2xl">
          <Link href="/apprendre" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-6 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au Blog
          </Link>

          {!isFinished ? (
            <motion.div 
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <motion.div 
                  initial={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
              
              <span className="text-indigo-400 font-bold text-sm tracking-wider uppercase mb-2 block">
                Question {currentQuestion + 1} / {questions.length}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">
                {questions[currentQuestion].question}
              </h1>

              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      selectedAnswer === index 
                        ? index === questions[currentQuestion].correctAnswer 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100'
                          : 'bg-red-500/20 border-red-500 text-red-100'
                        : 'bg-[#2E3152] border-white/10 hover:bg-[#2E3152]/80 hover:border-indigo-500/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl text-center"
            >
              {score === questions.length ? (
                <>
                  <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(52,211,153,0.4)] animate-pulse">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Félicitations ! 🎉</h2>
                  <p className="text-lg text-gray-300 mb-6">
                    Vous avez répondu correctement à toutes les questions. La sécurité de vos fonds est essentielle.
                  </p>
                  <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-xl p-4 mb-8">
                    <p className="text-indigo-300 font-medium">
                      🎁 Récompense débloquée : <strong className="text-white">0% de frais sur votre premier achat !</strong>
                    </p>
                  </div>
                  <Link href="/acheter"
                    className="inline-block bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    Utiliser ma récompense
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Oups, presque !</h2>
                  <p className="text-lg text-gray-300 mb-8">
                    Vous avez obtenu {score} / {questions.length}. Révisez les concepts de sécurité et réessayez pour débloquer votre récompense.
                  </p>
                  <button 
                    onClick={() => { setCurrentQuestion(0); setScore(0); setIsFinished(false); setSelectedAnswer(null); }}
                    className="bg-[#2E3152] border border-white/10 text-white font-bold px-8 py-4 rounded-xl hover:bg-[#252844] transition-colors"
                  >
                    Recommencer le quiz
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
