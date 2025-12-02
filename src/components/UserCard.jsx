import { Mail, Phone, Edit2, Ban, CheckCircle, PhoneCall, CreditCard } from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';

export default function UserCard({ user, onEdit, onToggleActive, onAssignMembership, onRenewMembership }) {
  const { darkMode } = useDarkMode();
  
  // Generar iniciales para el avatar
  const getInitials = () => {
    const nombre = user.nombre?.charAt(0) || '';
    const apellido = user.apellidoPaterno?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  };

  // Colores aleatorios para avatares
  const avatarColors = [
    'bg-gradient-to-br from-indigo-500 to-purple-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-cyan-500 to-blue-500',
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-amber-500 to-orange-500',
  ];
  
  const colorIndex = (user.nombre?.charCodeAt(0) || 0) % avatarColors.length;

  return (
    <div className={`group rounded-xl shadow-md hover:shadow-xl transition-all duration-300 
      overflow-hidden border transform hover:-translate-y-1
      ${!user.activo ? 'opacity-60' : ''} ${
        darkMode 
          ? 'bg-gray-900 border-gray-700 hover:border-indigo-500' 
          : 'bg-white border-gray-100 hover:border-indigo-200'
      }`}>
      
      {/* Header con gradiente */}
      <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          {user.activo ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              bg-emerald-100 text-emerald-700 shadow-sm">
              <CheckCircle size={12} />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              bg-gray-100 text-gray-600 shadow-sm">
              <Ban size={12} />
              Inactivo
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="px-6 pb-6 -mt-12 relative">
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full ${avatarColors[colorIndex]} 
          flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4
          ${!user.activo ? 'grayscale' : ''} ${
            darkMode ? 'ring-gray-900' : 'ring-white'
          }`}>
          {getInitials()}
        </div>

        {/* Información del usuario */}
        <div className="mt-4">
          <h3 className={`text-xl font-bold ${
            darkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
          </h3>
          
          <div className="mt-3 space-y-2">
            {/* Email */}
            <div className={`flex items-center gap-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Mail size={16} className="text-indigo-500" />
              <span className="text-sm">{user.correo}</span>
            </div>

            {/* Teléfono */}
            <div className={`flex items-center gap-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Phone size={16} className="text-indigo-500" />
              <span className="text-sm">{user.telefono}</span>
            </div>

            {/* Teléfono de emergencia */}
            {user.telefonoEmergencia && (
              <div className={`flex items-center gap-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <PhoneCall size={16} className="text-red-500" />
                <span className="text-sm">
                  <span className="text-xs text-gray-500">Emergencia:</span> {user.telefonoEmergencia}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Membresía */}
        {user.membership && (
          <div className={`mt-4 p-3 rounded-lg border-2 ${
            user.membership.daysRemaining > 7
              ? darkMode ? 'bg-emerald-900/20 border-emerald-700' : 'bg-emerald-50 border-emerald-200'
              : user.membership.daysRemaining > 3
              ? darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
              : user.membership.daysRemaining > 0
              ? darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
              : darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold uppercase ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Membresía
              </span>
              <span className={`text-xs font-bold ${
                user.membership.daysRemaining > 7
                  ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  : user.membership.daysRemaining > 3
                  ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  : user.membership.daysRemaining > 0
                  ? darkMode ? 'text-red-400' : 'text-red-600'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {user.membership.daysRemaining > 0 
                  ? `${user.membership.daysRemaining} días restantes`
                  : `Vencida hace ${Math.abs(user.membership.daysRemaining)} días`
                }
              </span>
            </div>
            <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {user.membership.nombre}
            </p>
            {/* Barra de progreso */}
            <div className={`mt-2 h-2 rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                className={`h-full transition-all ${
                  user.membership.daysRemaining > 7
                    ? 'bg-emerald-500'
                    : user.membership.daysRemaining > 3
                    ? 'bg-yellow-500'
                    : user.membership.daysRemaining > 0
                    ? 'bg-red-500'
                    : 'bg-gray-400'
                }`}
                style={{
                  width: `${Math.max(0, Math.min(100, (user.membership.daysRemaining / 30) * 100))}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-4 space-y-2">
          {user.membership ? (
            <div className="flex gap-2">
              <button
                onClick={() => onAssignMembership(user)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Cambiar Membresía"
              >
                <CreditCard size={16} />
                <span>Cambiar</span>
              </button>
              <button
                onClick={() => onRenewMembership(user)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  darkMode 
                    ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
                title="Añadir Membresía"
              >
                <CheckCircle size={16} />
                <span>Añadir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAssignMembership(user)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                darkMode 
                  ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
              title="Asignar Membresía"
            >
              <CreditCard size={16} />
              <span>Asignar Membresía</span>
            </button>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(user)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                darkMode 
                  ? 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              <Edit2 size={16} />
              <span>Editar</span>
            </button>
            <button
              onClick={() => onToggleActive(user)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                transition-colors font-medium ${
                  user.activo
                    ? darkMode
                      ? 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50'
                      : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    : darkMode
                    ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              title={user.activo ? 'Desactivar' : 'Activar'}
            >
              {user.activo ? <Ban size={16} /> : <CheckCircle size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
