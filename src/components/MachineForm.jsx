import { useState, useEffect } from 'react';
import { X, Save, Dumbbell, Plus, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';

const statusOptions = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_uso', label: 'En Uso' },
  { value: 'mantenimiento', label: 'En Mantenimiento' },
  { value: 'fuera_servicio', label: 'Fuera de Servicio' }
];

export default function MachineForm({ machine, categories, locations, onSubmit, onClose, onAddCategory, onAddLocation }) {
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    ubicacion: '',
    estado: 'disponible',
    fecha_compra: '',
    ultimo_mantenimiento: '',
    proximo_mantenimiento: '',
    notas: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (machine) {
      setFormData({
        nombre: machine.nombre || '',
        categoria: machine.categoria || '',
        marca: machine.marca || '',
        modelo: machine.modelo || '',
        numero_serie: machine.numero_serie || '',
        ubicacion: machine.ubicacion || '',
        estado: machine.estado || 'disponible',
        fecha_compra: machine.fecha_compra || '',
        ultimo_mantenimiento: machine.ultimo_mantenimiento || '',
        proximo_mantenimiento: machine.proximo_mantenimiento || '',
        notas: machine.notas || ''
      });
    } else if (categories && categories.length > 0) {
      setFormData(prev => ({ ...prev, categoria: categories[0].nombre }));
    }
  }, [machine, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrors({ submit: 'Error al guardar la máquina' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in border ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Dumbbell size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {machine ? 'Editar Máquina' : 'Nueva Máquina'}
                </h2>
                <p className="text-indigo-100 text-sm">Complete la información del equipo</p>
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
        <form onSubmit={handleSubmit} className={`p-6 overflow-y-auto max-h-[calc(90vh-180px)]`}>
          {errors.submit && (
            <div className={`p-4 rounded-lg border ${
              darkMode
                ? 'bg-red-900/20 border-red-700 text-red-300'
                : 'bg-red-100 border-red-300 text-red-700'
            }`}>
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="md:col-span-2 relative">
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
                    ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                    : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="Nombre"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Nombre *
              </label>
              {errors.nombre && touched.nombre && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.nombre}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="relative">
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${errors.categoria && touched.categoria
                    ? 'border-red-400 focus:border-red-500' 
                    : darkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                    : 'border-gray-200 focus:border-indigo-500'
                  }`}
              >
                <option value="">Seleccionar...</option>
                {categories && categories.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Categoría *
              </label>
              {onAddCategory && (
                <button
                  type="button"
                  onClick={onAddCategory}
                  className="absolute right-12 top-3 flex items-center gap-1 text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  title="Crear nueva categoría"
                >
                  <Plus size={14} />
                  Nueva
                </button>
              )}
              {errors.categoria && touched.categoria && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.categoria}
                </p>
              )}
            </div>

            {/* Estado */}
            <div className="relative">
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }`}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Estado
              </label>
            </div>

            {/* Marca */}
            <div className="relative">
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="Marca"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Marca
              </label>
            </div>

            {/* Modelo */}
            <div className="relative">
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="Modelo"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Modelo
              </label>
            </div>

            {/* Número de Serie */}
            <div className="relative">
              <input
                type="text"
                name="numero_serie"
                value={formData.numero_serie}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="Número de Serie"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Número de Serie
              </label>
            </div>

            {/* Ubicación */}
            <div className="relative">
              <select
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }`}
              >
                <option value="">Sin asignar</option>
                {locations && locations.map(loc => (
                  <option key={loc.id} value={loc.nombre}>{loc.nombre}</option>
                ))}
              </select>
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Ubicación
              </label>
              {onAddLocation && (
                <button
                  type="button"
                  onClick={onAddLocation}
                  className="absolute right-12 top-3 flex items-center gap-1 text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  title="Crear nueva ubicación"
                >
                  <Plus size={14} />
                  Nueva
                </button>
              )}
            </div>

            {/* Fecha de Compra */}
            <div className="relative">
              <input
                type="date"
                name="fecha_compra"
                value={formData.fecha_compra}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }`}
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Fecha de Compra
              </label>
            </div>

            {/* Último Mantenimiento */}
            <div className="relative">
              <input
                type="date"
                name="ultimo_mantenimiento"
                value={formData.ultimo_mantenimiento}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }`}
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Último Mantenimiento
              </label>
            </div>

            {/* Próximo Mantenimiento */}
            <div className="relative">
              <input
                type="date"
                name="proximo_mantenimiento"
                value={formData.proximo_mantenimiento}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }`}
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Próximo Mantenimiento
              </label>
            </div>

            {/* Notas */}
            <div className="md:col-span-2 relative">
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="3"
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all resize-none
                  ${darkMode
                  ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                  : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="Notas"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Notas
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className={`flex justify-end gap-3 pt-6 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {submitting ? 'Guardando...' : machine ? 'Guardar Cambios' : 'Crear Máquina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
