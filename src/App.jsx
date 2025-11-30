import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar, { SidebarItem } from "./components/Sidebar";
import GlobalSearch from "./components/GlobalSearch";
import { LayoutDashboard, Settings, Users, CreditCard, ShieldCheck, UserCheck, Dumbbell } from "lucide-react";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import MembershipsPage from "./pages/MembershipsPage";
import AdminsPage from "./pages/AdminsPage";
import SettingsPage from "./pages/SettingsPage";
import CheckinPage from "./pages/CheckinPage";
import MachinesPage from "./pages/MachinesPage";
import LoginPage from "./pages/LoginPage";
import { useDarkMode } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { user, isAuthenticated, loading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const nipBufferRef = useRef('');
  const nipTimeoutRef = useRef(null);

  // Escuchar Ctrl+K para abrir búsqueda y números para check-in
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K para búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Detectar si hay un input/textarea enfocado
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );

      // Si no hay input enfocado y se presiona un número
      if (!isInputFocused && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        
        // Agregar el número al buffer
        nipBufferRef.current += e.key;
        
        // Limpiar timeout anterior
        if (nipTimeoutRef.current) {
          clearTimeout(nipTimeoutRef.current);
        }
        
        // Navegar a check-in con el NIP acumulado
        navigate('/checkin', { 
          state: { initialNip: nipBufferRef.current },
          replace: location.pathname === '/checkin'
        });
        
        // Si ya tiene 4 dígitos, limpiar el buffer inmediatamente
        if (nipBufferRef.current.length >= 4) {
          nipBufferRef.current = '';
        } else {
          // Limpiar el buffer después de 2 segundos de inactividad
          nipTimeoutRef.current = setTimeout(() => {
            nipBufferRef.current = '';
          }, 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (nipTimeoutRef.current) {
        clearTimeout(nipTimeoutRef.current);
      }
    };
  }, [navigate, location.pathname]);

  // Mostrar pantalla de carga mientras verifica la sesión
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Verificar si el usuario es admin
  const isAdmin = user?.rol === 'admin';

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <Sidebar>
        <SidebarItem 
          icon={<LayoutDashboard size={20} />} 
          text="Dashboard" 
          to="/" 
          active={location.pathname === "/"} 
        />
        <SidebarItem 
          icon={<UserCheck size={20} />} 
          text="Check-in" 
          to="/checkin" 
          active={location.pathname === "/checkin"} 
        />
        <SidebarItem 
          icon={<Users size={20} />} 
          text="Usuarios" 
          to="/users" 
          active={location.pathname === "/users"} 
        />
        <SidebarItem 
          icon={<CreditCard size={20} />} 
          text="Membresías" 
          to="/memberships" 
          active={location.pathname === "/memberships"} 
        />
        <SidebarItem 
          icon={<Dumbbell size={20} />} 
          text="Máquinas" 
          to="/machines" 
          active={location.pathname === "/machines"} 
        />
        {isAdmin && (
          <SidebarItem 
            icon={<ShieldCheck size={20} />} 
            text="Usuarios del Sistema" 
            to="/admins" 
            active={location.pathname === "/admins"} 
          />
        )}
        <SidebarItem 
          icon={<Settings size={20} />} 
          text="Configuración" 
          to="/settings" 
          active={location.pathname === "/settings"} 
        />
      </Sidebar>
      
      <main className="flex-1 overflow-auto">
        {/* Definimos las rutas aquí */}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/memberships" element={<MembershipsPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          {isAdmin && <Route path="/admins" element={<AdminsPage />} />}
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Búsqueda Global */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export default App;