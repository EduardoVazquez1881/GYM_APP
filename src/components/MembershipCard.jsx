import { DollarSign, Calendar, Edit2, Ban, CheckCircle, Check } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

export default function MembershipCard({ membership, onEdit, onToggleActive }) {
  const { darkMode } = useDarkMode();
  
  return (
    <div className={`group rounded-xl shadow-md hover:shadow-xl transition-all duration-300 
      overflow-hidden border transform hover:-translate-y-1
      ${!membership.activo ? 'opacity-60' : ''} ${
        darkMode 
          ? 'bg-gray-900 border-gray-700 hover:border-emerald-500' 
          : 'bg-white border-gray-100 hover:border-emerald-200'
      }`}>
      
      {/* Header con gradiente */}
      <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          {membership.activo ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              bg-white/90 text-emerald-700 shadow-sm">
              <CheckCircle size={12} />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              bg-white/90 text-gray-600 shadow-sm">
              <Ban size={12} />
              Inactivo
            </span>
          )}
        </div>
        {/* Precio */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-baseline gap-1 text-white">
            <DollarSign size={20} />
            <span className="text-3xl font-bold">{membership.precio.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-6 py-5">
        {/* Nombre y duración */}
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${
            darkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {membership.nombre}
          </h3>
          
          <div className={`flex items-center gap-2 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Calendar size={16} className="text-emerald-500" />
            <span className="text-sm font-medium">
              {membership.duracionDias} {membership.duracionDias === 1 ? 'día' : 'días'}
            </span>
          </div>
        </div>

        {/* Descripción */}
        {membership.descripcion && (
          <p className={`text-sm mb-4 line-clamp-2 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {membership.descripcion}
          </p>
        )}

        {/* Beneficios */}
        {membership.beneficios && membership.beneficios.length > 0 && (
          <div className="mb-4">
            <h4 className={`text-xs font-semibold uppercase mb-2 ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Beneficios</h4>
            <div className="space-y-1">
              {membership.beneficios.slice(0, 3).map((beneficio, index) => (
                <div key={index} className={`flex items-start gap-2 text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Check size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{beneficio}</span>
                </div>
              ))}
              {membership.beneficios.length > 3 && (
                <p className="text-xs text-gray-500 ml-6">
                  +{membership.beneficios.length - 3} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className={`flex gap-2 mt-4 pt-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <button
            onClick={() => onEdit(membership)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
              darkMode 
                ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            <Edit2 size={16} />
            <span>Editar</span>
          </button>
          <button
            onClick={() => onToggleActive(membership)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
              transition-colors font-medium ${
                membership.activo
                  ? darkMode
                    ? 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50'
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : darkMode
                  ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            title={membership.activo ? 'Desactivar' : 'Activar'}
          >
            {membership.activo ? <Ban size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
