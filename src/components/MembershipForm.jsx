import { useState } from 'react';
import { X, CreditCard, DollarSign, Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

export default function MembershipForm({ onClose, onSubmit, initialData = null }) {
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState(initialData || {
    nombre: '',
    descripcion: '',
    duracionDias: '',
    precio: '',
    beneficios: []
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [newBeneficio, setNewBeneficio] = useState('');

  // Validación
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        return !value.trim() ? 'El nombre es requerido' : '';
      
      case 'duracionDias':
        if (!value) return 'La duración es requerida';
        if (isNaN(value) || parseInt(value) <= 0) return 'Debe ser un número positivo';
        return '';
      
      case 'precio':
        if (!value) return 'El precio es requerido';
        if (isNaN(value) || parseFloat(value) < 0) return 'Debe ser un número válido';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAddBeneficio = () => {
    if (newBeneficio.trim()) {
      setFormData(prev => ({
        ...prev,
        beneficios: [...prev.beneficios, newBeneficio.trim()]
      }));
      setNewBeneficio('');
    }
  };

  const handleRemoveBeneficio = (index) => {
    setFormData(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors = {};
    ['nombre', 'duracionDias', 'precio'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ nombre: true, duracionDias: true, precio: true });
      return;
    }

    // Convertir a números
    const dataToSubmit = {
      ...formData,
      duracionDias: parseInt(formData.duracionDias),
      precio: parseFloat(formData.precio)
    };

    onSubmit(dataToSubmit);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {initialData ? 'Editar Membresía' : 'Nueva Membresía'}
                </h2>
                <p className="text-emerald-100 text-sm">Configure el paquete de membresía</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Nombre */}
            <div className="relative">
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${errors.nombre && touched.nombre 
                    ? 'border-red-400 focus:border-red-500' 
                    : darkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-emerald-400'
                    : 'border-gray-200 focus:border-emerald-500'
                  }
                  placeholder-transparent`}
                placeholder="Nombre"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Nombre de la Membresía *
              </label>
              {errors.nombre && touched.nombre && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.nombre}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="relative">
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all placeholder-transparent resize-none ${
                  darkMode ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-emerald-400' : 'border-gray-200 focus:border-emerald-500'
                }`}
                placeholder="Descripción"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Descripción
              </label>
            </div>

            {/* Duración y Precio */}
            <div className="grid grid-cols-2 gap-4">
              {/* Duración */}
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Calendar size={20} />
                </div>
                <input
                  type="number"
                  name="duracionDias"
                  value={formData.duracionDias}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="1"
                  className={`peer w-full pl-12 pr-4 py-3 border-2 rounded-lg outline-none transition-all
                    ${errors.duracionDias && touched.duracionDias 
                      ? 'border-red-400 focus:border-red-500' 
                      : darkMode
                      ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-emerald-400'
                      : 'border-gray-200 focus:border-emerald-500'
                    }
                    placeholder-transparent`}
                  placeholder="Duración"
                />
                <label className="absolute left-11 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 
                  peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 transition-all">
                  Duración (días) *
                </label>
                {errors.duracionDias && touched.duracionDias && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.duracionDias}
                  </p>
                )}
              </div>

              {/* Precio */}
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <DollarSign size={20} />
                </div>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="0"
                  step="0.01"
                  className={`peer w-full pl-12 pr-4 py-3 border-2 rounded-lg outline-none transition-all
                    ${errors.precio && touched.precio 
                      ? 'border-red-400 focus:border-red-500' 
                      : darkMode
                      ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-emerald-400'
                      : 'border-gray-200 focus:border-emerald-500'
                    }
                    placeholder-transparent`}
                  placeholder="Precio"
                />
                <label className="absolute left-11 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 
                  peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 transition-all">
                  Precio ($) *
                </label>
                {errors.precio && touched.precio && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.precio}
                  </p>
                )}
              </div>
            </div>

            {/* Beneficios */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Beneficios
              </label>
              
              {/* Lista de beneficios */}
              {formData.beneficios.length > 0 && (
                <div className="mb-3 space-y-2">
                  {formData.beneficios.map((beneficio, index) => (
                    <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
                    }`}>
                      <span className={`flex-1 text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>✓ {beneficio}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBeneficio(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar beneficio */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBeneficio}
                  onChange={(e) => setNewBeneficio(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBeneficio())}
                  placeholder="Agregar beneficio..."
                  className={`flex-1 px-4 py-2 border-2 rounded-lg outline-none transition-colors ${
                    darkMode ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-500 focus:border-emerald-400' : 'border-gray-200 focus:border-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddBeneficio}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                    darkMode 
                      ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  <Plus size={18} />
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg 
                font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg 
                hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {initialData ? 'Actualizar' : 'Crear'} Membresía
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
