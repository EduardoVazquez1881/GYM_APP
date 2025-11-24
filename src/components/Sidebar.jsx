import { MoreVertical, ChevronLast, ChevronFirst, Moon, Sun } from "lucide-react";
import { useContext, createContext, useState } from "react";
import { Link } from "react-router-dom"; 
import { useDarkMode } from "../context/DarkModeContext";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <aside className={`h-screen w-min border-r shadow-sm flex flex-col transition-all duration-300 ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'
    }`}>
      <nav className="h-full flex flex-col" style={{ WebkitAppRegion: "drag" }}>
        
        {/* Header: Logo y Toggle */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? "w-32" : "w-0"}`}>
            <span className={`font-bold text-xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>GYM</span>
          </div>
          
          <button
            style={{ WebkitAppRegion: "no-drag" }} 
            onClick={() => setExpanded((curr) => !curr)}
            className={`p-1.5 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        {/* Lista de Items */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 py-2 space-y-1">{children}</ul>
        </SidebarContext.Provider>

        {/* Dark Mode Toggle - Compact Icon Only */}
        <div className="px-3 py-2">
          <button
            onClick={toggleDarkMode}
            style={{ WebkitAppRegion: "no-drag" }}
            className={`w-full flex items-center justify-center py-2 rounded-md cursor-pointer transition-colors ${
              darkMode
                ? 'hover:bg-gray-800 text-yellow-400'
                : 'hover:bg-indigo-50 text-indigo-600'
            }`}
            title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Footer: Perfil de Usuario */}
        <div className={`border-t p-3 flex items-center ${darkMode ? 'border-gray-700' : ''}`}>
          <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold ${
            darkMode 
              ? 'bg-indigo-900 text-indigo-300' 
              : 'bg-indigo-100 text-indigo-600'
          }`}>
            JP
          </div>
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all duration-300
              ${expanded ? "w-40 ml-3" : "w-0"}
            `}
          >
            <div className="leading-4">
              <h4 className={`font-semibold text-sm ${darkMode ? 'text-gray-200' : ''}`}>Juan Pérez</h4>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>juan@dev.com</span>
            </div>
            <button 
              style={{ WebkitAppRegion: "no-drag" }} 
              className={`p-1 rounded transition-colors ${
                darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100'
              }`}
            >
               <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}

// Componente Hijo (Item)
export function SidebarItem({ icon, text, to = "#", active, alert }) {
  const { expanded } = useContext(SidebarContext);
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
              ? darkMode
                ? "bg-indigo-900 text-indigo-200"
                : "bg-indigo-100 text-indigo-800"
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
            className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
              expanded ? "" : "top-2 right-2"
            }`}
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
              ${darkMode 
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