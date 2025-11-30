import { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, AlertCircle, DollarSign, Banknote, Smartphone, Building } from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export default function AssignMembershipModal({ user, onClose, onAssign }) {
  const { darkMode } = useDarkMode();
  const notification = useNotification();
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [registerPayment, setRegisterPayment] = useState(true);
  const [paymentNote, setPaymentNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const paymentMethods = [
    { id: 'efectivo', name: 'Efectivo', icon: Banknote },
    { id: 'tarjeta', name: 'Tarjeta', icon: CreditCard },
    { id: 'transferencia', name: 'Transferencia', icon: Building },
    { id: 'otro', name: 'Otro', icon: Smartphone }
  ];

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
      setSubmitting(true);
      
      // Asignar membresía
      await onAssign(parseInt(selectedMembership), startDate);
      
      // Registrar pago si está habilitado
      if (registerPayment) {
        const membership = memberships.find(m => m.id === parseInt(selectedMembership));
        if (membership) {
          await window.electron.payments.create({
            userId: user.id,
            membershipId: parseInt(selectedMembership),
            monto: membership.precio,
            metodoPago: paymentMethod,
            notas: paymentNote || `Pago por membresía ${membership.nombre}`
          });
          notification.success(`Pago de $${membership.precio} registrado correctamente`);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error assigning membership:', error);
      notification.error('Error al asignar membresía');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMembershipData = memberships.find(m => m.id === parseInt(selectedMembership));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in ${
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
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
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
            <div className="space-y-5">
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

              {/* Toggle de registro de pago */}
              <div className={`p-4 rounded-lg border-2 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <DollarSign className={`${registerPayment ? 'text-emerald-500' : 'text-gray-400'}`} size={20} />
                    <div>
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Registrar pago
                      </span>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Agregar al historial de pagos
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={registerPayment}
                      onChange={(e) => setRegisterPayment(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      registerPayment ? 'bg-emerald-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                        registerPayment ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </div>
                </label>

                {/* Opciones de pago */}
                {registerPayment && selectedMembershipData && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
                    {/* Método de pago */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Método de pago
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {paymentMethods.map(method => {
                          const Icon = method.icon;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setPaymentMethod(method.id)}
                              className={`p-3 rounded-lg border-2 text-center transition-all ${
                                paymentMethod === method.id
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                  : darkMode
                                    ? 'border-gray-600 hover:border-gray-500'
                                    : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Icon size={18} className={`mx-auto ${
                                paymentMethod === method.id
                                  ? 'text-emerald-500'
                                  : darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              <span className={`text-xs mt-1 block ${
                                paymentMethod === method.id
                                  ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                                  : darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {method.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Nota opcional */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Nota (opcional)
                      </label>
                      <input
                        type="text"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="Ej: Pago parcial, promoción..."
                        className={`w-full px-4 py-2 border-2 rounded-lg outline-none transition-colors text-sm ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-emerald-400'
                            : 'bg-white border-gray-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Información calculada */}
              {selectedMembershipData && endDate && (
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'
                }`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Resumen
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Membresía:</span>
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {selectedMembershipData.nombre}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Duración:</span>
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {selectedMembershipData.duracionDias} días
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fecha de fin:</span>
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {new Date(endDate).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <div className={`flex justify-between pt-2 border-t ${
                      darkMode ? 'border-emerald-700' : 'border-emerald-200'
                    }`}>
                      <span className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        Total:
                      </span>
                      <span className={`font-bold text-lg ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        ${selectedMembershipData.precio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className={`flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedMembership || submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg 
                    font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg 
                    hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:transform-none flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Asignar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
