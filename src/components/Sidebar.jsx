import { ChevronLast, ChevronFirst, Palette, LogOut, Search, Bell, Activity, TrendingUp, Users as UsersIcon } from "lucide-react";
import { useContext, createContext, useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { useDarkMode, useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useConfirmModal } from "./ConfirmModal";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  const [stats, setStats] = useState({ activeUsers: 0, expiringSoon: 0 });
  const { darkMode } = useDarkMode();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { confirm, ConfirmModal } = useConfirmModal();

  // Cargar estadísticas rápidas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const users = await window.electron.users.getAll();
        const activeUsers = users.filter(u => u.activo && u.membership?.daysRemaining > 0).length;
        const expiringSoon = users.filter(u => u.membership?.daysRemaining > 0 && u.membership?.daysRemaining <= 7).length;
        setStats({ activeUsers, expiringSoon });
      } catch (error) {
        console.error('Error loading sidebar stats:', error);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  // Detectar si es un tema con sidebar con gradiente (colores especiales)
  const hasGradientSidebar = ['sunset', 'ocean', 'forest', 'lavender', 'rose'].includes(theme.id);
  const isLightThemeWithGradient = hasGradientSidebar && !theme.isDark;

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: '¿Cerrar sesión?',
      message: '¿Está seguro que desea cerrar sesión?',
      confirmText: 'Cerrar Sesión',
      cancelText: 'Cancelar',
      type: 'warning'
    });
    
    if (confirmed) {
      logout();
    }
  };

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (user?.nombre) {
      return user.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  return (
    <>
    <aside className={`h-screen w-min border-r shadow-sm flex flex-col transition-all duration-300 ${
      hasGradientSidebar 
        ? `${theme.colors.sidebarBg} border-transparent shadow-lg`
        : darkMode 
          ? 'bg-gray-900 border-gray-700 shadow-lg' 
          : 'bg-white border-gray-200'
    }`}>
      <nav className="h-full flex flex-col" style={{ WebkitAppRegion: "drag" }}>
        
        {/* Header: Logo y Toggle */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? "w-32" : "w-0"}`}>
            <span className={`font-bold text-xl ${
              hasGradientSidebar 
                ? 'text-white' 
                : darkMode 
                  ? theme.colors.accentText
                  : 'text-indigo-600'
            }`}>GYM</span>
          </div>
          
          <button
            style={{ WebkitAppRegion: "no-drag" }} 
            onClick={() => setExpanded((curr) => !curr)}
            className={`p-1.5 rounded-lg transition-colors ${
              hasGradientSidebar
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        {/* Lista de Items */}
        <SidebarContext.Provider value={{ expanded, hasGradientSidebar, theme }}>
          <ul className="flex-1 px-3 py-2 space-y-1">{children}</ul>
        </SidebarContext.Provider>

        {/* Buscar con Ctrl+K */}
        <div className="px-3 py-2">
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true,
                bubbles: true
              });
              window.dispatchEvent(event);
            }}
            style={{ WebkitAppRegion: "no-drag" }}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
              hasGradientSidebar
                ? 'hover:bg-white/10 text-white/80 hover:text-white'
                : darkMode
                  ? 'hover:bg-gray-800 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="Buscar (Ctrl+K)"
          >
            <Search size={18} />
            {expanded && (
              <>
                <span className="text-sm flex-1 text-left">Buscar</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  hasGradientSidebar
                    ? 'bg-white/20'
                    : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  ⌘K
                </span>
              </>
            )}
          </button>
        </div>

        {/* Estadísticas Rápidas */}
        {expanded && (
          <div className={`px-3 py-2 mx-1 rounded-lg mb-2 ${
            hasGradientSidebar 
              ? 'bg-white/10' 
              : darkMode 
                ? 'bg-gray-800' 
                : 'bg-gray-100'
          }`}>
            <p className={`text-xs font-semibold mb-2 flex items-center gap-1 ${
              hasGradientSidebar ? 'text-white/70' : darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Activity size={14} /> Actividad
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={hasGradientSidebar ? 'text-white/80' : darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Activos
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  hasGradientSidebar ? 'bg-green-500/30 text-green-200' : darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                }`}>
                  {stats.activeUsers}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={hasGradientSidebar ? 'text-white/80' : darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Por Vencer
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  stats.expiringSoon > 0 
                    ? (hasGradientSidebar ? 'bg-amber-500/30 text-amber-200' : darkMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-700')
                    : (hasGradientSidebar ? 'bg-green-500/30 text-green-200' : darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')
                }`}>
                  {stats.expiringSoon}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer: Perfil de Usuario */}
        <div className={`border-t p-3 flex items-center ${
          hasGradientSidebar 
            ? 'border-white/20' 
            : darkMode 
              ? 'border-gray-700' 
              : 'border-gray-200'
        }`}>
          <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold ${
            hasGradientSidebar
              ? 'bg-white/20 text-white'
              : darkMode 
                ? 'bg-indigo-900 text-indigo-300' 
                : 'bg-indigo-100 text-indigo-600'
          }`}>
            {getInitials()}
          </div>
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all duration-300
              ${expanded ? "w-40 ml-3" : "w-0"}
            `}
          >
            <div className="leading-4">
              <h4 className={`font-semibold text-sm ${
                hasGradientSidebar ? 'text-white' : darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {user?.nombre || user?.username || 'Admin'}
              </h4>
              <span className={`text-xs ${
                hasGradientSidebar ? 'text-white/70' : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {user?.rol === 'admin' ? 'Administrador' : user?.rol === 'recepcion' ? 'Recepción' : user?.rol || 'Administrador'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              style={{ WebkitAppRegion: "no-drag" }} 
              className={`p-1 rounded transition-colors ${
                hasGradientSidebar 
                  ? 'hover:bg-white/20 text-white/70 hover:text-white'
                  : darkMode 
                    ? 'hover:bg-red-900 text-gray-300 hover:text-red-400' 
                    : 'hover:bg-red-100 hover:text-red-600'
              }`}
              title="Cerrar sesión"
            >
               <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>
    </aside>
    <ConfirmModal />
    </>
  );
}

// Componente Hijo (Item)
export function SidebarItem({ icon, text, to = "#", active, alert }) {
  const { expanded, hasGradientSidebar, theme } = useContext(SidebarContext);
  const { darkMode } = useDarkMode();

  return (
    <Link to={to} style={{ WebkitAppRegion: "no-drag" }} className="block">
      <li
        className={`
          relative flex items-center py-2 px-3 my-1
          font-medium rounded-md cursor-pointer
          transition-colors group
          ${
            active
              ? hasGradientSidebar
                ? "bg-white/20 text-white"
                : darkMode
                  ? "bg-indigo-900 text-indigo-200"
                  : "bg-indigo-100 text-indigo-800"
              : hasGradientSidebar
                ? "hover:bg-white/10 text-white/80"
                : darkMode
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-indigo-50 text-gray-600"
          }
        `}
      >
        <div className="flex items-center justify-center">{icon}</div>
        
        <span
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? "w-40 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>

        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded ${
              hasGradientSidebar ? 'bg-white' : 'bg-indigo-400'
            } ${expanded ? "" : "top-2 right-2"}`}
          />
        )}

        {!expanded && (
          <div
            className={`
              absolute left-full rounded-md px-2 py-1 ml-6
              text-sm
              invisible opacity-20 -translate-x-3 transition-all
              group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
              whitespace-nowrap z-50
              ${hasGradientSidebar
                ? 'bg-gray-900 text-white'
                : darkMode 
                  ? 'bg-gray-800 text-gray-200' 
                  : 'bg-indigo-100 text-indigo-800'
              }
            `}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}