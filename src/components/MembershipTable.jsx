import { DollarSign, Calendar, Edit2, Ban, CheckCircle, Check } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

export default function MembershipTable({ memberships, onEdit, onToggleActive }) {
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
                : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-gray-200'
            }`}>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Membresía
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Beneficios
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {memberships.map((membership) => (
              <tr 
                key={membership.id} 
                className={`transition-colors group ${!membership.activo ? 'opacity-50' : ''} ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                }`}
              >
                {/* Membresía */}
                <td className="px-6 py-4">
                  <div>
                    <div className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {membership.nombre}
                    </div>
                    {membership.descripcion && (
                      <div className={`text-sm line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {membership.descripcion}
                      </div>
                    )}
                  </div>
                </td>

                {/* Duración */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center gap-2 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Calendar size={14} className="text-emerald-500" />
                    <span>{membership.duracionDias} {membership.duracionDias === 1 ? 'día' : 'días'}</span>
                  </div>
                </td>

                {/* Precio */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <DollarSign size={16} />
                    <span>{membership.precio.toFixed(2)}</span>
                  </div>
                </td>

                {/* Beneficios */}
                <td className="px-6 py-4">
                  {membership.beneficios && membership.beneficios.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500" />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {membership.beneficios.length} {membership.beneficios.length === 1 ? 'beneficio' : 'beneficios'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {membership.activo ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                      bg-emerald-100 text-emerald-700">
                      <CheckCircle size={14} />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                      bg-gray-100 text-gray-600">
                      <Ban size={14} />
                      Inactivo
                    </span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(membership)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'text-emerald-400 hover:bg-gray-700' 
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onToggleActive(membership)}
                      className={`p-2 rounded-lg transition-colors ${
                        membership.activo 
                          ? darkMode
                            ? 'text-orange-400 hover:bg-gray-700'
                            : 'text-orange-600 hover:bg-orange-50'
                          : darkMode
                          ? 'text-emerald-400 hover:bg-gray-700'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={membership.activo ? 'Desactivar' : 'Activar'}
                    >
                      {membership.activo ? <Ban size={16} /> : <CheckCircle size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {memberships.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No se encontraron membresías
        </div>
      )}
    </div>
  );
}
