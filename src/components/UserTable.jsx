import { Mail, Phone, Edit2, Ban, CheckCircle, PhoneCall } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

export default function UserTable({ users, onEdit, onToggleActive, onRenewMembership }) {
  const { darkMode } = useDarkMode();
  
  return (
    <div className={`rounded-xl shadow-md overflow-hidden border ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-800 border-gray-700' 
                : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-gray-200'
            }`}>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Usuario
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                Emergencia
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Membresía
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Estado
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {users.map((user, index) => {
              // Generar iniciales
              const initials = ((user.nombre?.charAt(0) || '') + (user.apellidoPaterno?.charAt(0) || '')).toUpperCase();
              
              // Colores para avatares
              const avatarColors = [
                'bg-gradient-to-br from-indigo-500 to-purple-500',
                'bg-gradient-to-br from-pink-500 to-rose-500',
                'bg-gradient-to-br from-cyan-500 to-blue-500',
                'bg-gradient-to-br from-emerald-500 to-teal-500',
                'bg-gradient-to-br from-amber-500 to-orange-500',
              ];
              const colorIndex = (user.nombre?.charCodeAt(0) || 0) % avatarColors.length;

              return (
                <tr 
                  key={user.id} 
                  className={`transition-colors group ${!user.activo ? 'opacity-50' : ''} ${
                    darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Usuario */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${avatarColors[colorIndex]} 
                        flex items-center justify-center text-white text-sm font-bold shadow-sm
                        ${!user.activo ? 'grayscale' : ''}`}>
                        {initials}
                      </div>
                      <div>
                        <div className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contacto - Oculto en móviles muy pequeños */}
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Mail size={14} className="text-indigo-500 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{user.correo}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Phone size={14} className="text-indigo-500 flex-shrink-0" />
                        <span>{user.telefono}</span>
                      </div>
                    </div>
                  </td>

                  {/* Emergencia - Oculto en tablets y móviles */}
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    {user.telefonoEmergencia ? (
                      <div className={`flex items-center gap-2 text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <PhoneCall size={14} className="text-red-500 flex-shrink-0" />
                        <span>{user.telefonoEmergencia}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Membresía */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.membership ? (
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {user.membership.nombre}
                        </div>
                        <div className={`text-xs font-medium ${
                          user.membership.daysRemaining > 7
                            ? 'text-emerald-500'
                            : user.membership.daysRemaining > 3
                            ? 'text-yellow-500'
                            : user.membership.daysRemaining > 0
                            ? 'text-red-500'
                            : 'text-gray-500'
                        }`}>
                          {user.membership.daysRemaining > 0 
                            ? `${user.membership.daysRemaining} días`
                            : `Vencida hace ${Math.abs(user.membership.daysRemaining)} días`
                          }
                        </div>
                      </div>
                    ) : (
                      <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Sin membresía
                      </span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        bg-emerald-100 text-emerald-700 shadow-sm">
                        <CheckCircle size={12} />
                        Activo
                      </span>
                    ) : user.status === 'expired' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        bg-red-100 text-red-700 shadow-sm">
                        <Ban size={12} />
                        Expirado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        bg-yellow-100 text-yellow-700 shadow-sm">
                        <Ban size={12} />
                        Pendiente
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.status === 'expired' && onRenewMembership && (
                        <button
                          onClick={() => onRenewMembership(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title="Renovar Membresía"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50' 
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onToggleActive(user)}
                        className={`p-2 rounded-lg transition-colors ${
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {users.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No se encontraron usuarios
        </div>
      )}
    </div>
  );
}
