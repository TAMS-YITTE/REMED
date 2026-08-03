'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }

    // Check if already installed in Standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS, show prompt if not standalone
    if (iosDevice) {
      const dismissed = localStorage.getItem('remedly_pwa_ios_dismissed');
      if (!dismissed) setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    if (isIos) {
      localStorage.setItem('remedly_pwa_ios_dismissed', 'true');
    }
  };

  if (isStandalone || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#1e2038] border border-indigo-500/40 rounded-2xl p-4 shadow-[0_10px_30px_rgba(99,102,241,0.3)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Installer Remedly sur votre écran d'accueil</h4>
            <p className="text-xs text-gray-300 mt-0.5">
              Utilisez Remedly comme une vraie application mobile, sans passer par l'App Store ou Google Play !
            </p>
          </div>
        </div>
        <button onClick={dismissBanner} className="text-gray-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
        {isIos ? (
          <div className="text-[11px] text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            Sur iPhone : appuyez sur <span className="font-bold">Partager ⎋</span> puis <span className="font-bold">"Sur l'écran d'accueil ➕"</span>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Installer l'Application
          </button>
        )}
      </div>
    </div>
  );
}
