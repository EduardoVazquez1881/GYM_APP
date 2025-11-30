import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, User, CreditCard, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch({ isOpen, onClose }) {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Enfocar input cuando se abre
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Buscar usuarios
  const searchUsers = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const users = await window.electron.users.search(searchQuery);
      
      // Formatear resultados
      const formattedResults = users.slice(0, 8).map(user => ({
        id: user.id,
        type: 'user',
        title: `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno || ''}`.trim(),
        subtitle: user.correo,
        extra: user.nip ? `NIP: ${user.nip}` : null,
        membership: user.membership?.nombre || 'Sin membresía',
        membershipStatus: user.membership 
          ? user.membership.daysRemaining > 7 
            ? 'active' 
            : user.membership.daysRemaining > 0 
              ? 'expiring' 
              : 'expired'
          : 'none',
        data: user
      }));

      setResults(formattedResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  // Manejar teclas
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Seleccionar resultado
  const handleSelect = (result) => {
    if (result.type === 'user') {
      navigate('/users', { state: { searchUser: result.data.id } });
    }
    onClose();
  };

  // Scroll al elemento seleccionado
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedEl = resultsRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, results.length]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-xl mx-4 rounded-2xl shadow-2xl overflow-hidden animate-slide-in ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Input de búsqueda */}
        <div className={`flex items-center gap-3 p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Search className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar usuarios por nombre, correo, teléfono o NIP..."
            className={`flex-1 bg-transparent outline-none text-lg ${
              darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
            }`}
            style={{ WebkitAppRegion: 'no-drag' }}
          />
          {loading && <Loader2 className="animate-spin text-indigo-500" size={20} />}
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            ESC
          </div>
        </div>

        {/* Resultados */}
        <div 
          ref={resultsRef}
          className="max-h-[400px] overflow-y-auto"
        >
          {query && !loading && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={40} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                No se encontraron resultados para "{query}"
              </p>
            </div>
          )}

          {!query && !loading && (
            <div className="p-8 text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Escribe para buscar usuarios
              </p>
              <div className={`mt-4 flex justify-center gap-4 text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <span className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>↑</span>
                  <span className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>↓</span>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>Enter</span>
                  seleccionar
                </span>
              </div>
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className={`p-4 cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? darkMode ? 'bg-indigo-900/50' : 'bg-indigo-50'
                  : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  result.membershipStatus === 'active'
                    ? 'bg-green-100 text-green-600'
                    : result.membershipStatus === 'expiring'
                    ? 'bg-yellow-100 text-yellow-600'
                    : result.membershipStatus === 'expired'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {result.title.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {result.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {result.subtitle}
                    </span>
                    {result.extra && (
                      <>
                        <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                        <span className={`text-sm font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {result.extra}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Membresía */}
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    result.membershipStatus === 'active'
                      ? 'bg-green-100 text-green-700'
                      : result.membershipStatus === 'expiring'
                      ? 'bg-yellow-100 text-yellow-700'
                      : result.membershipStatus === 'expired'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <CreditCard size={12} />
                    {result.membership}
                  </span>
                </div>

                {/* Flecha */}
                <ArrowRight className={`${
                  index === selectedIndex
                    ? 'text-indigo-500'
                    : darkMode ? 'text-gray-600' : 'text-gray-300'
                }`} size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`px-4 py-2 border-t text-xs flex items-center justify-between ${
          darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
        }`}>
          <span>Búsqueda rápida</span>
          <span className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>Ctrl</span>
            +
            <span className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>K</span>
          </span>
        </div>
      </div>
    </div>
  );
}
