import { useState } from 'react';
import { X, Dumbbell, Tag, MapPin, Calendar, Hash, FileText, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';

const ESTADOS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_uso', label: 'En Uso' },
  { value: 'mantenimiento', label: 'En Mantenimiento' },
  { value: 'fuera_servicio', label: 'Fuera de Servicio' }
];

export default function MachineForm({ onClose, onSubmit, initialData = null, categories = [] }) {
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState(initialData ? {
    nombre: initialData.nombre || '',
    categoria: initialData.categoria || '',
    marca: initialData.marca || '',
    modelo: initialData.modelo || '',
    numeroSerie: initialData.numero_serie || '',
    ubicacion: initialData.ubicacion || '',
    estado: initialData.estado || 'disponible',
    fechaCompra: initialData.fecha_compra || '',
    ultimoMantenimiento: initialData.ultimo_mantenimiento || '',
    proximoMantenimiento: initialData.proximo_mantenimiento || '',
    notas: initialData.notas || ''
  } : {
    nombre: '',
    categoria: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    ubicacion: '',
    estado: 'disponible',
    fechaCompra: '',
    ultimoMantenimiento: '',
    proximoMantenimiento: '',
    notas: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        return !value.trim() ? 'El nombre es requerido' : '';
      case 'categoria':
        return !value ? 'La categoría es requerida' : '';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    ['nombre', 'categoria'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ nombre: true, categoria: true });
      return;
    }

    onSubmit(formData);
  };

  const inputClass = (field) => `
    w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
    ${errors[field] && touched[field] 
      ? 'border-red-400 focus:border-red-500' 
      : darkMode
        ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-orange-400'
        : 'border-gray-200 focus:border-orange-500'
    }
  `;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Dumbbell size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {initialData ? 'Editar Máquina' : 'Nueva Máquina'}
                </h2>
                <p className="text-orange-100 text-sm">Registra el equipo del gimnasio</p>
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
          <div className="space-y-5">
            {/* Nombre y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nombre del Equipo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej: Caminadora Pro 5000"
                  className={inputClass('nombre')}
                />
                {errors.nombre && touched.nombre && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('categoria')}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.categoria && touched.categoria && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.categoria}
                  </p>
                )}
              </div>
            </div>

            {/* Marca y Modelo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Tag size={14} className="inline mr-1" />
                  Marca
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Ej: Life Fitness"
                  className={inputClass('marca')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Modelo
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  placeholder="Ej: T5-GO"
                  className={inputClass('modelo')}
                />
              </div>
            </div>

            {/* Número de Serie y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Hash size={14} className="inline mr-1" />
                  Número de Serie
                </label>
                <input
                  type="text"
                  name="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={handleChange}
                  placeholder="Ej: SN-123456789"
                  className={inputClass('numeroSerie')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <MapPin size={14} className="inline mr-1" />
                  Ubicación
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  placeholder="Ej: Zona Cardio - Planta Baja"
                  className={inputClass('ubicacion')}
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Estado
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ESTADOS.map(estado => (
                  <label
                    key={estado.value}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.estado === estado.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : darkMode
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="estado"
                      value={estado.value}
                      checked={formData.estado === estado.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`text-sm font-medium ${
                      formData.estado === estado.value
                        ? 'text-orange-600 dark:text-orange-400'
                        : darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {estado.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Calendar size={14} className="inline mr-1" />
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  name="fechaCompra"
                  value={formData.fechaCompra}
                  onChange={handleChange}
                  className={inputClass('fechaCompra')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Último Mantenimiento
                </label>
                <input
                  type="date"
                  name="ultimoMantenimiento"
                  value={formData.ultimoMantenimiento}
                  onChange={handleChange}
                  className={inputClass('ultimoMantenimiento')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Próximo Mantenimiento
                </label>
                <input
                  type="date"
                  name="proximoMantenimiento"
                  value={formData.proximoMantenimiento}
                  onChange={handleChange}
                  className={inputClass('proximoMantenimiento')}
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FileText size={14} className="inline mr-1" />
                Notas Adicionales
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows={3}
                placeholder="Observaciones, instrucciones especiales, etc."
                className={`${inputClass('notas')} resize-none`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg 
                font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg 
                hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {initialData ? 'Actualizar' : 'Crear'} Máquina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
