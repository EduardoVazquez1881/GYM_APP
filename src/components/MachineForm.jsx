import { useState, useEffect } from 'react';
import { X, Save, Dumbbell } from 'lucide-react';

const statusOptions = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'en_uso', label: 'En Uso' },
  { value: 'mantenimiento', label: 'En Mantenimiento' },
  { value: 'fuera_servicio', label: 'Fuera de Servicio' }
];

export default function MachineForm({ machine, categories, locations, onSubmit, onClose }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Dumbbell className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {machine ? 'Editar Máquina' : 'Nueva Máquina'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-300">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Caminadora, Press de Banca"
                className={`w-full px-2.5 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.nombre && (
                <p className="mt-0.5 text-xs text-red-500">{errors.nombre}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`w-full px-2.5 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.categoria ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleccionar...</option>
                {categories && categories.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-0.5 text-xs text-red-500">{errors.categoria}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Marca
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Life Fitness, Precor"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="T5, 95X"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Número de Serie */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Serie
              </label>
              <input
                type="text"
                name="numero_serie"
                value={formData.numero_serie}
                onChange={handleChange}
                placeholder="Número de serie"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ubicación
              </label>
              <select
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin asignar</option>
                {locations && locations.map(loc => (
                  <option key={loc.id} value={loc.nombre}>{loc.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fecha de Compra */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Compra
              </label>
              <input
                type="date"
                name="fecha_compra"
                value={formData.fecha_compra}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Último Mantenimiento */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Último Mantenimiento
              </label>
              <input
                type="date"
                name="ultimo_mantenimiento"
                value={formData.ultimo_mantenimiento}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Próximo Mantenimiento */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Próximo Mantenimiento
              </label>
              <input
                type="date"
                name="proximo_mantenimiento"
                value={formData.proximo_mantenimiento}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows="2"
                placeholder="Notas adicionales..."
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
