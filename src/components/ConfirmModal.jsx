import { useState } from 'react';
import { AlertTriangle, X, Check, Trash2 } from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';

/**
 * Hook para usar el modal de confirmación
 * @returns {Object} { confirm, ConfirmModal }
 */
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolveRef, setResolveRef] = useState(null);

  const confirm = ({
    title = '¿Estás seguro?',
    message = 'Esta acción no se puede deshacer.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning', // warning, danger, info
    icon = null
  }) => {
    return new Promise((resolve) => {
      setConfig({ title, message, confirmText, cancelText, type, icon });
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef?.(false);
  };

  const ConfirmModal = () => {
    const { darkMode } = useDarkMode();
    
    if (!isOpen) return null;

    const typeStyles = {
      warning: {
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        Icon: AlertTriangle
      },
      danger: {
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        buttonBg: 'bg-red-600 hover:bg-red-700',
        Icon: Trash2
      },
      info: {
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        Icon: Check
      }
    };

    const style = typeStyles[config.type] || typeStyles.warning;
    const IconComponent = config.icon || style.Icon;

    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl animate-scale-in ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${style.iconBg}`}>
              <IconComponent size={32} className={style.iconColor} />
            </div>
          </div>

          {/* Title */}
          <h3 className={`text-xl font-bold text-center mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {config.title}
          </h3>

          {/* Message */}
          <p className={`text-center mb-6 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {config.message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {config.cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-colors ${style.buttonBg}`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmModal };
}
