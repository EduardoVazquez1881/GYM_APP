import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';

export default function UserForm({ onClose, onSubmit, initialData = null }) {
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    apellidoPaterno: initialData?.apellidoPaterno || '',
    apellidoMaterno: initialData?.apellidoMaterno || '',
    telefono: initialData?.telefono || '',
    correo: initialData?.correo || '',
    telefonoEmergencia: initialData?.telefonoEmergencia || '',
    nip: initialData?.nip || ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(initialData?.membership?.id || '');
  const [startDate, setStartDate] = useState(
    initialData?.membership?.startDate 
      ? new Date(initialData.membership.startDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [loadingNip, setLoadingNip] = useState(false);

  // Cargar membresías y generar NIP automático para nuevos usuarios
  useEffect(() => {
    const loadData = async () => {
      try {
        const all = await window.electron.memberships.getAll();
        setMemberships(all.filter(m => m.activo));
        
        // Generar NIP automático solo para nuevos usuarios
        if (!initialData) {
          await generateNewNip();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Función para generar nuevo NIP
  const generateNewNip = async () => {
    try {
      setLoadingNip(true);
      const nip = await window.electron.users.generateNip();
      setFormData(prev => ({ ...prev, nip }));
    } catch (error) {
      console.error('Error generating NIP:', error);
    } finally {
      setLoadingNip(false);
    }
  };

  // Validación
  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
      case 'apellidoPaterno':
        return !value?.trim() ? 'Este campo es requerido' : '';
      
      case 'correo':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value?.trim()) return 'El correo es requerido';
        if (!emailRegex.test(value)) return 'Correo inválido';
        return '';
      
      case 'telefono':
      case 'telefonoEmergencia':
        const phoneRegex = /^\d{10}$/;
        if (name === 'telefono' && !value?.trim()) return 'El teléfono es requerido';
        if (value && !phoneRegex.test(value.replace(/\D/g, ''))) return 'Debe tener 10 dígitos';
        if (value && !phoneRegex.test(value.replace(/\D/g, ''))) return 'Debe tener 10 dígitos';
        return '';

      case 'nip':
        if (!value) return 'El NIP es requerido';
        if (!/^\d{4}$/.test(value)) return 'El NIP debe tener exactamente 4 dígitos';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    // Incluir datos de membresía si se seleccionó una
    const dataToSubmit = {
      ...formData,
      membershipId: selectedMembership ? parseInt(selectedMembership) : null,
      membershipStartDate: selectedMembership ? startDate : null
    };

    try {
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.message || '';
      
      // Errores específicos de campos
      if (errorMessage.includes('UNIQUE constraint failed: users.correo')) {
        setErrors(prev => ({ ...prev, correo: 'Este correo electrónico ya está registrado' }));
      } else if (errorMessage.includes('UNIQUE constraint failed: users.nip')) {
        setErrors(prev => ({ ...prev, nip: 'Este NIP ya está en uso por otro usuario' }));
      } else if (errorMessage.includes('NIP ya está en uso')) {
        setErrors(prev => ({ ...prev, nip: 'Este NIP ya está en uso por otro usuario' }));
      } else if (errorMessage.includes('NIP debe tener')) {
        setErrors(prev => ({ ...prev, nip: 'El NIP debe tener exactamente 4 dígitos' }));
      } else if (errorMessage.includes('UNIQUE constraint failed: users.telefono')) {
        setErrors(prev => ({ ...prev, telefono: 'Este teléfono ya está registrado' }));
      } else if (errorMessage.includes('correo')) {
        setErrors(prev => ({ ...prev, correo: 'Error con el correo electrónico' }));
      } else if (errorMessage.includes('telefono') || errorMessage.includes('teléfono')) {
        setErrors(prev => ({ ...prev, telefono: 'Error con el teléfono' }));
      } else {
        // Error general - mostrar el mensaje del servidor o uno genérico
        const displayMessage = errorMessage || 'Ocurrió un error al guardar. Intente nuevamente.';
        setErrors(prev => ({ ...prev, submit: displayMessage }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {initialData ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <p className="text-indigo-100 text-sm">Complete la información del miembro</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Apellido Paterno */}
            <div className="relative">
              <input
                type="text"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${errors.apellidoPaterno && touched.apellidoPaterno 
                    ? 'border-red-400 focus:border-red-500' 
                    : darkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                    : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="Apellido Paterno"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Apellido Paterno *
              </label>
              {errors.apellidoPaterno && touched.apellidoPaterno && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.apellidoPaterno}
                </p>
              )}
            </div>

            {/* Apellido Materno */}
            <div className="relative">
              <input
                type="text"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all placeholder-transparent ${
                  darkMode ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400' : 'border-gray-200 focus:border-indigo-500'
                }`}
                placeholder="Apellido Materno"
              />
              <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Apellido Materno
              </label>
            </div>

            {/* Teléfono */}
            <div className="relative">
              <div className={darkMode ? 'absolute left-3 top-3 text-gray-500' : 'absolute left-3 top-3 text-gray-400'}>
                <Phone size={20} />
              </div>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full pl-12 pr-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${errors.telefono && touched.telefono 
                    ? 'border-red-400 focus:border-red-500' 
                    : darkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                    : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="Teléfono"
              />
              <label className={`absolute left-11 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Teléfono *
              </label>
              {errors.telefono && touched.telefono && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.telefono}
                </p>
              )}
            </div>

            {/* Correo */}
            <div className="relative md:col-span-2">
              <div className={darkMode ? 'absolute left-3 top-3 text-gray-500' : 'absolute left-3 top-3 text-gray-400'}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full pl-12 pr-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${errors.correo && touched.correo 
                    ? 'border-red-400 focus:border-red-500' 
                    : darkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                    : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="Correo"
              />
              <label className={`absolute left-11 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Correo Electrónico *
              </label>
              {errors.correo && touched.correo && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.correo}
                </p>
              )}
            </div>

            {/* Teléfono de Emergencia */}
            <div className="relative">
              <div className={darkMode ? 'absolute left-3 top-3 text-gray-500' : 'absolute left-3 top-3 text-gray-400'}>
                <Phone size={20} />
              </div>
              <input
                type="tel"
                name="telefonoEmergencia"
                value={formData.telefonoEmergencia}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full pl-12 pr-4 py-3 border-2 rounded-lg outline-none transition-all placeholder-transparent ${
                  darkMode ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400' : 'border-gray-200 focus:border-indigo-500'
                }`}
                placeholder="Teléfono de Emergencia"
              />
              <label className={`absolute left-11 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                Teléfono de Emergencia
              </label>
            </div>

            {/* NIP */}
            <div className="relative">
              <div className={darkMode ? 'absolute left-3 top-3 text-gray-500' : 'absolute left-3 top-3 text-gray-400'}>
                <Lock size={20} />
              </div>
              <input
                type="text"
                name="nip"
                maxLength={4}
                value={formData.nip}
                onChange={(e) => {
                  // Solo permitir dígitos
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData(prev => ({ ...prev, nip: value }));
                  if (touched.nip) {
                    setErrors(prev => ({ ...prev, nip: validateField('nip', value) }));
                  }
                }}
                onBlur={handleBlur}
                className={`peer w-full pl-12 pr-12 py-3 border-2 rounded-lg outline-none transition-all
                  ${errors.nip && touched.nip 
                    ? 'border-red-400 focus:border-red-500' 
                    : darkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-100 focus:border-indigo-400'
                    : 'border-gray-200 focus:border-indigo-500'
                  }
                  placeholder-transparent`}
                placeholder="NIP de Acceso"
              />
              <label className={`absolute left-11 -top-2.5 px-1 text-sm font-medium transition-all
                peer-placeholder-shown:text-base peer-placeholder-shown:top-3
                peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600 ${
                  darkMode ? 'bg-gray-900 text-gray-300 peer-placeholder-shown:text-gray-500' : 'bg-white text-gray-600 peer-placeholder-shown:text-gray-400'
                }`}>
                NIP de Acceso (4 dígitos) *
              </label>
              {/* Botón para regenerar NIP */}
              <button
                type="button"
                onClick={generateNewNip}
                disabled={loadingNip}
                className={`absolute right-3 top-3 p-1 rounded transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
                }`}
                title="Generar nuevo NIP"
              >
                <RefreshCw size={18} className={loadingNip ? 'animate-spin' : ''} />
              </button>
              {errors.nip && touched.nip && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.nip}
                </p>
              )}
            </div>

            {/* Membresía (Opcional) */}
            <div className="md:col-span-2 border-t pt-6 mt-2">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Asignar Membresía (Opcional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <select
                    value={selectedMembership}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all appearance-none ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-indigo-400' 
                        : 'bg-white border-gray-200 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Sin Membresía</option>
                    {memberships.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} - ${m.precio} ({m.duracion_dias} días)
                      </option>
                    ))}
                  </select>
                  <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium bg-white text-indigo-600 ${
                    darkMode ? 'bg-gray-900 text-indigo-400' : 'bg-white text-indigo-600'
                  }`}>
                    Seleccionar Plan
                  </label>
                </div>

                {selectedMembership && (
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-indigo-400' 
                          : 'bg-white border-gray-200 focus:border-indigo-500'
                      }`}
                    />
                    <label className={`absolute left-3 -top-2.5 px-1 text-sm font-medium ${
                      darkMode ? 'bg-gray-900 text-indigo-400' : 'bg-white text-indigo-600'
                    }`}>
                      Fecha de Inicio
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mensaje de error general */}
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Error al guardar</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              {initialData ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
