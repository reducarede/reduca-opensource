import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial state from body class
    setIsDark(!document.body.classList.contains('light-theme'));
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.add('light-theme');
      localStorage.setItem('reduc_theme', 'light');
      setIsDark(false);
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('reduc_theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full glass hover:bg-white/20 transition-colors text-orange-500"
      title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
