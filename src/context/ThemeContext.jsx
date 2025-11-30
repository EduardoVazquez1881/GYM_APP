import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Definición de temas disponibles
export const themes = {
  light: {
    id: 'light',
    name: 'Claro',
    icon: '☀️',
    isDark: false,
    colors: {
      // Fondos
      bgPrimary: 'bg-gray-100',
      bgSecondary: 'bg-white',
      bgTertiary: 'bg-gray-50',
      // Textos
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-400',
      // Bordes
      border: 'border-gray-200',
      borderFocus: 'focus:border-indigo-500',
      // Inputs
      inputBg: 'bg-white',
      inputBorder: 'border-gray-200',
      // Sidebar
      sidebarBg: 'bg-white',
      sidebarHover: 'hover:bg-indigo-50',
      sidebarActive: 'bg-indigo-100 text-indigo-800',
      // Cards
      cardBg: 'bg-white',
      cardHover: 'hover:bg-gray-50',
      // Accent colors
      accent: 'indigo',
      accentBg: 'bg-indigo-600',
      accentHover: 'hover:bg-indigo-700',
      accentText: 'text-indigo-600',
      accentLight: 'bg-indigo-100',
    }
  },
  dark: {
    id: 'dark',
    name: 'Oscuro',
    icon: '🌙',
    isDark: true,
    colors: {
      bgPrimary: 'bg-gray-900',
      bgSecondary: 'bg-gray-800',
      bgTertiary: 'bg-gray-700',
      textPrimary: 'text-gray-100',
      textSecondary: 'text-gray-400',
      textMuted: 'text-gray-500',
      border: 'border-gray-700',
      borderFocus: 'focus:border-indigo-400',
      inputBg: 'bg-gray-700',
      inputBorder: 'border-gray-600',
      sidebarBg: 'bg-gray-900',
      sidebarHover: 'hover:bg-gray-800',
      sidebarActive: 'bg-indigo-900 text-indigo-200',
      cardBg: 'bg-gray-800',
      cardHover: 'hover:bg-gray-700',
      accent: 'indigo',
      accentBg: 'bg-indigo-600',
      accentHover: 'hover:bg-indigo-700',
      accentText: 'text-indigo-400',
      accentLight: 'bg-indigo-900/30',
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Medianoche',
    icon: '🌌',
    isDark: true,
    colors: {
      bgPrimary: 'bg-slate-950',
      bgSecondary: 'bg-slate-900',
      bgTertiary: 'bg-slate-800',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-400',
      textMuted: 'text-slate-500',
      border: 'border-slate-700',
      borderFocus: 'focus:border-blue-400',
      inputBg: 'bg-slate-800',
      inputBorder: 'border-slate-700',
      sidebarBg: 'bg-slate-950',
      sidebarHover: 'hover:bg-slate-800',
      sidebarActive: 'bg-blue-900/50 text-blue-300',
      cardBg: 'bg-slate-900',
      cardHover: 'hover:bg-slate-800',
      accent: 'blue',
      accentBg: 'bg-blue-600',
      accentHover: 'hover:bg-blue-700',
      accentText: 'text-blue-400',
      accentLight: 'bg-blue-900/30',
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Atardecer',
    icon: '🌅',
    isDark: false,
    colors: {
      bgPrimary: 'bg-orange-50',
      bgSecondary: 'bg-white',
      bgTertiary: 'bg-amber-50',
      textPrimary: 'text-orange-900',
      textSecondary: 'text-orange-700',
      textMuted: 'text-orange-400',
      border: 'border-orange-200',
      borderFocus: 'focus:border-orange-500',
      inputBg: 'bg-white',
      inputBorder: 'border-orange-200',
      sidebarBg: 'bg-gradient-to-b from-orange-600 to-rose-600',
      sidebarHover: 'hover:bg-white/10',
      sidebarActive: 'bg-white/20 text-white',
      cardBg: 'bg-white',
      cardHover: 'hover:bg-orange-50',
      accent: 'orange',
      accentBg: 'bg-gradient-to-r from-orange-500 to-rose-500',
      accentHover: 'hover:from-orange-600 hover:to-rose-600',
      accentText: 'text-orange-600',
      accentLight: 'bg-orange-100',
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Océano',
    icon: '🌊',
    isDark: true,
    colors: {
      bgPrimary: 'bg-cyan-950',
      bgSecondary: 'bg-cyan-900',
      bgTertiary: 'bg-cyan-800',
      textPrimary: 'text-cyan-50',
      textSecondary: 'text-cyan-300',
      textMuted: 'text-cyan-500',
      border: 'border-cyan-700',
      borderFocus: 'focus:border-teal-400',
      inputBg: 'bg-cyan-800',
      inputBorder: 'border-cyan-700',
      sidebarBg: 'bg-gradient-to-b from-cyan-900 to-teal-900',
      sidebarHover: 'hover:bg-cyan-800',
      sidebarActive: 'bg-teal-800 text-teal-200',
      cardBg: 'bg-cyan-900',
      cardHover: 'hover:bg-cyan-800',
      accent: 'teal',
      accentBg: 'bg-gradient-to-r from-cyan-500 to-teal-500',
      accentHover: 'hover:from-cyan-600 hover:to-teal-600',
      accentText: 'text-teal-400',
      accentLight: 'bg-teal-900/40',
    }
  },
  forest: {
    id: 'forest',
    name: 'Bosque',
    icon: '🌲',
    isDark: true,
    colors: {
      bgPrimary: 'bg-emerald-950',
      bgSecondary: 'bg-emerald-900',
      bgTertiary: 'bg-emerald-800',
      textPrimary: 'text-emerald-50',
      textSecondary: 'text-emerald-300',
      textMuted: 'text-emerald-500',
      border: 'border-emerald-700',
      borderFocus: 'focus:border-green-400',
      inputBg: 'bg-emerald-800',
      inputBorder: 'border-emerald-700',
      sidebarBg: 'bg-gradient-to-b from-emerald-900 to-green-900',
      sidebarHover: 'hover:bg-emerald-800',
      sidebarActive: 'bg-green-800 text-green-200',
      cardBg: 'bg-emerald-900',
      cardHover: 'hover:bg-emerald-800',
      accent: 'green',
      accentBg: 'bg-gradient-to-r from-emerald-500 to-green-500',
      accentHover: 'hover:from-emerald-600 hover:to-green-600',
      accentText: 'text-green-400',
      accentLight: 'bg-green-900/40',
    }
  },
  lavender: {
    id: 'lavender',
    name: 'Lavanda',
    icon: '💜',
    isDark: false,
    colors: {
      bgPrimary: 'bg-purple-50',
      bgSecondary: 'bg-white',
      bgTertiary: 'bg-violet-50',
      textPrimary: 'text-purple-900',
      textSecondary: 'text-purple-700',
      textMuted: 'text-purple-400',
      border: 'border-purple-200',
      borderFocus: 'focus:border-purple-500',
      inputBg: 'bg-white',
      inputBorder: 'border-purple-200',
      sidebarBg: 'bg-gradient-to-b from-purple-600 to-violet-600',
      sidebarHover: 'hover:bg-white/10',
      sidebarActive: 'bg-white/20 text-white',
      cardBg: 'bg-white',
      cardHover: 'hover:bg-purple-50',
      accent: 'purple',
      accentBg: 'bg-gradient-to-r from-purple-500 to-violet-500',
      accentHover: 'hover:from-purple-600 hover:to-violet-600',
      accentText: 'text-purple-600',
      accentLight: 'bg-purple-100',
    }
  },
  rose: {
    id: 'rose',
    name: 'Rosa',
    icon: '🌸',
    isDark: false,
    colors: {
      bgPrimary: 'bg-pink-50',
      bgSecondary: 'bg-white',
      bgTertiary: 'bg-rose-50',
      textPrimary: 'text-rose-900',
      textSecondary: 'text-rose-700',
      textMuted: 'text-rose-400',
      border: 'border-rose-200',
      borderFocus: 'focus:border-rose-500',
      inputBg: 'bg-white',
      inputBorder: 'border-rose-200',
      sidebarBg: 'bg-gradient-to-b from-rose-500 to-pink-500',
      sidebarHover: 'hover:bg-white/10',
      sidebarActive: 'bg-white/20 text-white',
      cardBg: 'bg-white',
      cardHover: 'hover:bg-rose-50',
      accent: 'rose',
      accentBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
      accentHover: 'hover:from-rose-600 hover:to-pink-600',
      accentText: 'text-rose-600',
      accentLight: 'bg-rose-100',
    }
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    icon: '❄️',
    isDark: true,
    colors: {
      bgPrimary: 'bg-[#2E3440]',
      bgSecondary: 'bg-[#3B4252]',
      bgTertiary: 'bg-[#434C5E]',
      textPrimary: 'text-[#ECEFF4]',
      textSecondary: 'text-[#D8DEE9]',
      textMuted: 'text-[#4C566A]',
      border: 'border-[#4C566A]',
      borderFocus: 'focus:border-[#88C0D0]',
      inputBg: 'bg-[#3B4252]',
      inputBorder: 'border-[#4C566A]',
      sidebarBg: 'bg-[#2E3440]',
      sidebarHover: 'hover:bg-[#3B4252]',
      sidebarActive: 'bg-[#434C5E] text-[#88C0D0]',
      cardBg: 'bg-[#3B4252]',
      cardHover: 'hover:bg-[#434C5E]',
      accent: 'cyan',
      accentBg: 'bg-[#88C0D0]',
      accentHover: 'hover:bg-[#8FBCBB]',
      accentText: 'text-[#88C0D0]',
      accentLight: 'bg-[#88C0D0]/20',
    }
  },
  dracula: {
    id: 'dracula',
    name: 'Drácula',
    icon: '🧛',
    isDark: true,
    colors: {
      bgPrimary: 'bg-[#282A36]',
      bgSecondary: 'bg-[#44475A]',
      bgTertiary: 'bg-[#6272A4]',
      textPrimary: 'text-[#F8F8F2]',
      textSecondary: 'text-[#BD93F9]',
      textMuted: 'text-[#6272A4]',
      border: 'border-[#44475A]',
      borderFocus: 'focus:border-[#FF79C6]',
      inputBg: 'bg-[#44475A]',
      inputBorder: 'border-[#6272A4]',
      sidebarBg: 'bg-[#282A36]',
      sidebarHover: 'hover:bg-[#44475A]',
      sidebarActive: 'bg-[#44475A] text-[#FF79C6]',
      cardBg: 'bg-[#44475A]',
      cardHover: 'hover:bg-[#6272A4]/30',
      accent: 'pink',
      accentBg: 'bg-[#FF79C6]',
      accentHover: 'hover:bg-[#FF92D0]',
      accentText: 'text-[#FF79C6]',
      accentLight: 'bg-[#FF79C6]/20',
    }
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('appTheme');
    return saved && themes[saved] ? saved : 'light';
  });

  const theme = themes[currentTheme];

  useEffect(() => {
    localStorage.setItem('appTheme', currentTheme);
    
    // Manejar clase dark para compatibilidad
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Aplicar colores al root para uso global
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme, theme.isDark]);

  const setTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  // Compatibilidad con darkMode existente
  const darkMode = theme.isDark;
  const toggleDarkMode = () => {
    setCurrentTheme(prev => themes[prev].isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currentTheme, 
      setTheme, 
      themes,
      // Compatibilidad con código existente
      darkMode,
      toggleDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Hook de compatibilidad con DarkMode
export function useDarkMode() {
  const { darkMode, toggleDarkMode } = useTheme();
  return { darkMode, toggleDarkMode };
}
