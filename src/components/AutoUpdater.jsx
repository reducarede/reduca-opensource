import React, { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function AutoUpdater() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const VERSION_URL = 'https://reduca.zonaeducacional.org/version.json';

  useEffect(() => {
    // Only run on native Android/iOS
    if (!Capacitor.isNativePlatform()) {
      setIsChecking(false);
      return;
    }

    const checkForUpdates = async () => {
      try {
        // 1. Get current app version info
        const info = await App.getInfo();
        const currentBuild = parseInt(info.build || '1', 10);

        // 2. Fetch latest version info from server
        const response = await fetch(VERSION_URL + '?t=' + new Date().getTime());
        const data = await response.json();
        
        const latestBuild = parseInt(data.build || '1', 10);

        // 3. Compare builds
        if (latestBuild > currentBuild) {
          setUpdateInfo(data);
          setShowModal(true);
        }
      } catch (error) {
        console.error('Erro ao buscar atualização:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Delay check slightly so it doesn't block initial render
    setTimeout(checkForUpdates, 3000);
  }, []);

  const handleUpdate = () => {
    if (updateInfo?.url) {
      // Use window.open with _system to open the device's browser
      // and download the APK directly
      window.open(updateInfo.url, '_system');
      setShowModal(false);
    }
  };

  if (!showModal || !updateInfo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
        >
          {/* Visual Effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full"></div>

          <button 
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full z-10"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6 relative z-10">
            <Download size={32} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2 relative z-10">
            Atualização Disponível
          </h2>
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full border border-slate-700">
              Versão {updateInfo.version}
            </span>
          </div>

          <p className="text-slate-400 mb-6 relative z-10 text-sm">
            {updateInfo.releaseNotes || 'Uma nova versão com melhorias e correções está disponível para baixar.'}
          </p>

          <div className="flex flex-col gap-3 relative z-10">
            <button 
              onClick={handleUpdate}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Baixar e Instalar
            </button>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl border border-slate-700/50 transition-all"
            >
              Lembrar mais tarde
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
