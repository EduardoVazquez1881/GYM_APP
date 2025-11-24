import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar, { SidebarItem } from "./components/Sidebar";
import { LayoutDashboard, Settings, Users, CreditCard } from "lucide-react";
import UsersPage from "./pages/UsersPage";
import MembershipsPage from "./pages/MembershipsPage";
import { useDarkMode } from "./context/DarkModeContext";


// Páginas simples para probar
const DashboardPage = () => <div className="text-2xl">Bienvenido al Dashboard 🏠</div>;
const SettingsPage = () => <div className="text-2xl">Configuraciones del Sistema ⚙️</div>;

function App() {
  const location = useLocation();
  const { darkMode } = useDarkMode();

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
          <Route path="/users" element={<UsersPage />} />
          <Route path="/memberships" element={<MembershipsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;