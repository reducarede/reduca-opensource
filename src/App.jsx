import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Blog from './pages/Blog';
import Apps from './pages/Apps';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Escambo from './pages/Escambo';
import Forum from './pages/Forum';
import ForumTopic from './pages/ForumTopic';
import Correio from './pages/Correio';
import JogoForca from './pages/JogoForca';
import VisualNovelMales from './pages/VisualNovelMales';
import Turmas from './pages/Turmas';
import ScrollToTop from './components/ScrollToTop';
import AutoUpdater from './components/AutoUpdater';
import OnboardingModal from './components/OnboardingModal';
import { supabase } from './supabase';
import { usePushNotifications } from './hooks/usePushNotifications';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';

import GlobalMailNotifier from './components/GlobalMailNotifier';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

function AnimatedRoutes({ session }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition>{!session ? <Login /> : <Navigate to="/" />}</PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          
          {/* Protected Routes */}
          <Route path="/" element={<PageTransition>{session ? <Home user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/blog" element={<PageTransition>{session ? <Blog user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/marketplace" element={<PageTransition>{session ? <Marketplace user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/apps" element={<PageTransition>{session ? <Apps /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/admin" element={<PageTransition>{session ? <Admin user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/groups" element={<PageTransition>{session ? <Groups user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/groups/:id" element={<PageTransition>{session ? <GroupDetail user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/escambo" element={<PageTransition>{session ? <Escambo user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/forum" element={<PageTransition>{session ? <Forum user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/forum/:id" element={<PageTransition>{session ? <ForumTopic user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/correio" element={<PageTransition>{session ? <Correio user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/jogoforca" element={<PageTransition>{session ? <JogoForca /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/males" element={<PageTransition>{session ? <VisualNovelMales /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/turmas" element={<PageTransition>{session ? <Turmas user={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/profile" element={<PageTransition>{session ? <Profile currentUser={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
          <Route path="/profile/:id" element={<PageTransition>{session ? <Profile currentUser={session.user} /> : <Navigate to="/login" />}</PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('reduc_theme') || 'dark');

  usePushNotifications(session?.user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('reduc_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-orange-500 font-bold">Carregando Reduca...</div>;

  const routerBasename = "";

  return (
    <div className="min-h-screen transition-colors duration-300 relative text-[var(--text-primary)] overflow-x-hidden w-full">
      <Router basename={routerBasename}>
        <ScrollToTop />
        <AnimatedRoutes session={session} />
        <AutoUpdater />
        <OnboardingModal session={session} />
        {session && <GlobalMailNotifier user={session.user} />}
      </Router>
    </div>
  );
}
