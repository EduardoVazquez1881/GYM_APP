import { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

export default function AssignMembershipModal({ user, onClose, onAssign }) {
  const { darkMode } = useDarkMode();
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberships();
  }, []);

  useEffect(() => {
    if (selectedMembership && startDate) {
      calculateEndDate();
    }
  }, [selectedMembership, startDate]);

  const loadMemberships = async () => {
    try {
      const allMemberships = await window.electron.memberships.getAll();
      // Solo mostrar membresías activas
      setMemberships(allMemberships.filter(m => m.activo));
    } catch (error) {
      console.error('Error loading memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEndDate = () => {
    const membership = memberships.find(m => m.id === parseInt(selectedMembership));
    if (membership && startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + membership.duracionDias);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMembership) return;

    try {
      await onAssign(parseInt(selectedMembership), startDate);
      onClose();
    } catch (error) {
      console.error('Error assigning membership:', error);
    }
  };

  const selectedMembershipData = memberships.find(m => m.id === parseInt(selectedMembership));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in ${
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
                <h2 className="text-2xl font-bold">Asignar Membresía</h2>
                <p className="text-emerald-100 text-sm">{user.nombre} {user.apellidoPaterno}</p>
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
        <form onSubmit={handleSubmit} className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cargando membresías...</p>
            </div>
          ) : memberships.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No hay membresías disponibles
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Crea una membresía primero
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selector de Membresía */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Seleccionar Membresía *
                </label>
                <select
                  value={selectedMembership}
                  onChange={(e) => setSelectedMembership(e.target.value)}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-emerald-400'
                      : 'bg-white border-gray-200 focus:border-emerald-500'
                  }`}
                >
                  <option value="">-- Selecciona una membresía --</option>
                  {memberships.map(membership => (
                    <option key={membership.id} value={membership.id}>
                      {membership.nombre} - ${membership.precio} ({membership.duracionDias} días)
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de Inicio */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Fecha de Inicio *
                </label>
                <div className="relative">
                  <Calendar size={20} className={`absolute left-3 top-3 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg outline-none transition-colors ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-emerald-400'
                        : 'bg-white border-gray-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Información calculada */}
              {selectedMembershipData && endDate && (
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'
                }`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Resumen
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">Duración:</span> {selectedMembershipData.duracionDias} días
                    </p>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">Fecha de fin:</span> {new Date(endDate).toLocaleDateString('es-MX')}
                    </p>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      <span className="font-medium">Precio:</span> ${selectedMembershipData.precio.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
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
                  disabled={!selectedMembership}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg 
                    font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg 
                    hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:transform-none"
                >
                  Asignar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
