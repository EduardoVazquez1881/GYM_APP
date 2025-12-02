import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  LogIn, 
  LogOut, 
  Clock, 
  Users, 
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Timer,
  TrendingUp,
  Calendar,
  Award,
  History,
  X
} from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export default function CheckinPage() {
  const { darkMode } = useDarkMode();
  const notification = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayCheckins, setTodayCheckins] = useState([]);
  const [currentlyInGym, setCurrentlyInGym] = useState([]);
  const [stats, setStats] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [showError, setShowError] = useState(false);
  const inputRef = useRef(null);
  const lastProcessedNipRef = useRef('');
  const autoCheckinRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Recibir NIP inicial desde la navegación (cuando se escriben números globalmente)
  useEffect(() => {
    const initialNip = location.state?.initialNip;
    if (initialNip && initialNip !== lastProcessedNipRef.current && !isProcessingRef.current) {
      const newNip = initialNip.slice(0, 4);
      setNip(newNip);
      
      // Si el NIP tiene 4 dígitos, marcar para auto check-in
      if (newNip.length === 4) {
        autoCheckinRef.current = true;
        lastProcessedNipRef.current = initialNip;
      }
      
      // Limpiar el state de navegación para evitar re-procesamiento
      navigate(location.pathname, { replace: true, state: {} });
      
      inputRef.current?.focus();
    }
  }, [location.state?.initialNip, navigate, location.pathname]);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
    // Enfocar el input al cargar
    inputRef.current?.focus();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [checkins, inGym, statsData] = await Promise.all([
        window.electron.checkins.getToday(),
        window.electron.checkins.getCurrentlyInGym(),
        window.electron.checkins.getStats('today')
      ]);
      setTodayCheckins(checkins);
      setCurrentlyInGym(inGym);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading checkin data:', error);
    }
  };

  const handleNipChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setNip(value);
    
    // Auto check-in cuando se completan 4 dígitos
    if (value.length === 4) {
      autoCheckinRef.current = true;
    }
  };

  // Función de check-in
  const performCheckin = async (nipValue) => {
    if (nipValue.length !== 4) {
      notification.warning('El NIP debe tener 4 dígitos');
      return;
    }

    // Evitar procesamiento doble
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setLoading(true);
      setShowError(false);
      setErrorInfo(null);
      
      const result = await window.electron.checkins.checkInByNip(nipValue);
      
      setLastAction(result);
      setShowSuccess(true);
      
      if (result.action === 'checkin') {
        notification.success(`¡Bienvenido ${result.user.nombre}!`);
      } else {
        notification.success(`¡Hasta pronto ${result.user.nombre}!`);
      }
      
      // Limpiar NIP inmediatamente
      setNip('');
      loadData();
      
      // Ocultar mensaje de éxito después de 15 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setLastAction(null);
      }, 15000);
      
    } catch (error) {
      console.error('Check-in error:', error);
      
      // Determinar el tipo de error
      const errorMessage = error.message || 'Error al procesar check-in';
      let errorType = 'unknown';
      let errorTitle = 'Error';
      let errorDescription = errorMessage;
      
      if (errorMessage.includes('NIP no válido') || errorMessage.includes('inactivo')) {
        errorType = 'nip_invalid';
        errorTitle = 'NIP No Válido';
        errorDescription = 'El NIP ingresado no existe o el usuario está inactivo.';
      } else if (errorMessage.includes('membresía ha expirado')) {
        errorType = 'membership_expired';
        errorTitle = 'Membresía Expirada';
        errorDescription = 'La membresía de este usuario ha expirado. Por favor, renuévela en recepción.';
      } else if (errorMessage.includes('no tiene membresía')) {
        errorType = 'no_membership';
        errorTitle = 'Sin Membresía';
        errorDescription = 'Este usuario no tiene una membresía asignada. Por favor, asígnele una en recepción.';
      }
      
      setErrorInfo({
        type: errorType,
        title: errorTitle,
        description: errorDescription,
        nip: nipValue
      });
      setShowError(true);
      
      notification.error(errorMessage);
      
      // Limpiar NIP
      setNip('');
      
      // Ocultar error después de 10 segundos
      setTimeout(() => {
        setShowError(false);
        setErrorInfo(null);
      }, 10000);
      
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
      // Pequeño delay antes de enfocar para asegurar que el estado se limpió
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Efecto para ejecutar auto check-in
  useEffect(() => {
    if (nip.length === 4 && autoCheckinRef.current && !loading && !isProcessingRef.current) {
      autoCheckinRef.current = false;
      performCheckin(nip);
    }
  }, [nip, loading]);

  const handleCheckin = useCallback(async () => {
    performCheckin(nip);
  }, [nip]);

  // Manejar Enter para check-in
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && nip.length === 4) {
      handleCheckin();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    // Si el formato es "YYYY-MM-DD HH:MM:SS" (desde SQLite local)
    if (dateString.includes(' ') && !dateString.includes('T')) {
      const [, time] = dateString.split(' ');
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    }
    // Si es formato ISO
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Si el formato es "YYYY-MM-DD HH:MM:SS"
    if (dateString.includes(' ') && !dateString.includes('T')) {
      const [datePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('es-MX', { 
        weekday: 'short', day: 'numeric', month: 'short' 
      });
    }
    return new Date(dateString).toLocaleDateString('es-MX', { 
      weekday: 'short', day: 'numeric', month: 'short' 
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return '-';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 
                flex items-center justify-center shadow-lg">
                <UserCheck size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Check-in / Check-out</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentlyInGym?.length || 0} {currentlyInGym?.length === 1 ? 'usuario en el gimnasio' : 'usuarios en el gimnasio'}
                </p>
              </div>
            </div>
            
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 
                transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw size={20} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel de Check-in (principal) */}
          <div className={`lg:col-span-2 rounded-2xl shadow-xl overflow-hidden ${
            darkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            {/* Sección de entrada de NIP */}
            <div className={`p-8 text-white transition-all duration-500 ${
              showError 
                ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600'
            }`}>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Ingresa tu NIP</h2>
                <p className={showError ? 'text-red-100' : 'text-green-100'}>
                  Escribe tu código de 4 dígitos para registrar tu entrada o salida
                </p>
              </div>
              
              <div className="mt-8 flex flex-col items-center">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={nip}
                    onChange={handleNipChange}
                    onKeyPress={handleKeyPress}
                    placeholder="• • • •"
                    className={`w-64 h-20 text-center text-5xl font-mono font-bold tracking-[1rem]
                      bg-white/20 border-2 rounded-2xl
                      placeholder:text-white/50 text-white
                      focus:outline-none focus:bg-white/30
                      transition-all ${
                        showError 
                          ? 'border-white/50 focus:border-white' 
                          : 'border-white/30 focus:border-white'
                      }`}
                    maxLength={4}
                    disabled={loading}
                    style={{ WebkitAppRegion: 'no-drag' }}
                  />
                </div>
                
                <button
                  onClick={handleCheckin}
                  disabled={nip.length !== 4 || loading}
                  className={`mt-6 px-12 py-4 rounded-xl font-bold text-lg transition-all
                    flex items-center gap-3 ${
                      nip.length === 4 && !loading
                        ? showError
                          ? 'bg-white text-red-600 hover:bg-red-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-white text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-white/30 text-white/70 cursor-not-allowed'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <UserCheck size={24} />
                      Registrar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de éxito con historial del usuario */}
            {showSuccess && lastAction && (
              <div className={`p-6 animate-fade-in ${
                lastAction.action === 'checkin' 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-b-2 border-green-200' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-blue-200'
              }`}>
                {/* Encabezado con información del usuario */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                      lastAction.action === 'checkin'
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                        : 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white'
                    }`}>
                      {lastAction.action === 'checkin' ? <LogIn size={40} /> : <LogOut size={40} />}
                    </div>
                    <div>
                      <h3 className={`text-3xl font-bold ${
                        lastAction.action === 'checkin' ? 'text-green-800' : 'text-blue-800'
                      }`}>
                        {lastAction.action === 'checkin' ? '¡Bienvenido!' : '¡Hasta pronto!'}
                      </h3>
                      <p className={`text-xl font-semibold ${
                        lastAction.action === 'checkin' ? 'text-green-700' : 'text-blue-700'
                      }`}>
                        {lastAction.user.nombre} {lastAction.user.apellidoPaterno} {lastAction.user.apellidoMaterno || ''}
                      </p>
                      <p className={`text-sm font-medium ${
                        lastAction.action === 'checkin' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {formatTime(lastAction.action === 'checkin' ? lastAction.checkInTime : lastAction.checkOutTime)}
                        {/* Mostrar duración de la sesión en checkout */}
                        {lastAction.action === 'checkout' && lastAction.sessionDurationFormatted && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-200 rounded-full text-blue-800 font-bold">
                            ⏱️ {lastAction.sessionDurationFormatted}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => { setShowSuccess(false); setLastAction(null); }}
                    className={`p-2 rounded-lg transition-colors ${
                      lastAction.action === 'checkin'
                        ? 'hover:bg-green-100 text-green-600'
                        : 'hover:bg-blue-100 text-blue-600'
                    }`}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Aviso si se cerraron sesiones anteriores automáticamente */}
                {lastAction.user.autoClosedSessions > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-yellow-100 border border-yellow-300 flex items-center gap-3">
                    <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
                    <p className="text-yellow-800 text-sm">
                      <strong>Aviso:</strong> Se cerró automáticamente {lastAction.user.autoClosedSessions} sesión(es) de días anteriores que quedaron sin registrar salida.
                    </p>
                  </div>
                )}

                {/* Tarjetas de información */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Membresía */}
                  <div className={`p-4 rounded-xl ${
                    lastAction.action === 'checkin' ? 'bg-white/70' : 'bg-white/70'
                  } shadow-sm`}>
                    <div className="flex items-center gap-3">
                      <Award className={
                        lastAction.action === 'checkin' ? 'text-green-500' : 'text-blue-500'
                      } size={24} />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Membresía</p>
                        <p className="text-lg font-bold text-gray-800">{lastAction.user.membership}</p>
                      </div>
                    </div>
                  </div>

                  {/* Días restantes */}
                  <div className={`p-4 rounded-xl shadow-sm ${
                    lastAction.user.daysRemaining <= 5 
                      ? 'bg-red-50 border border-red-200' 
                      : lastAction.user.daysRemaining <= 10
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-white/70'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Calendar className={
                        lastAction.user.daysRemaining <= 5 
                          ? 'text-red-500' 
                          : lastAction.user.daysRemaining <= 10
                            ? 'text-yellow-500'
                            : lastAction.action === 'checkin' ? 'text-green-500' : 'text-blue-500'
                      } size={24} />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Días restantes</p>
                        <p className={`text-lg font-bold ${
                          lastAction.user.daysRemaining <= 5 
                            ? 'text-red-600' 
                            : lastAction.user.daysRemaining <= 10
                              ? 'text-yellow-600'
                              : 'text-gray-800'
                        }`}>
                          {lastAction.user.daysRemaining} días
                          {lastAction.user.daysRemaining <= 5 && (
                            <span className="text-xs ml-1 text-red-500">⚠️ ¡Renovar pronto!</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visitas del período */}
                  <div className={`p-4 rounded-xl ${
                    lastAction.action === 'checkin' ? 'bg-white/70' : 'bg-white/70'
                  } shadow-sm`}>
                    <div className="flex items-center gap-3">
                      <TrendingUp className={
                        lastAction.action === 'checkin' ? 'text-green-500' : 'text-blue-500'
                      } size={24} />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Visitas este período</p>
                        <p className="text-lg font-bold text-gray-800">{lastAction.user.totalVisits} visitas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fechas de membresía */}
                <div className={`p-3 rounded-lg mb-4 flex items-center justify-between text-sm ${
                  lastAction.action === 'checkin' ? 'bg-green-100/50' : 'bg-blue-100/50'
                }`}>
                  <span className={lastAction.action === 'checkin' ? 'text-green-700' : 'text-blue-700'}>
                    <strong>Inicio:</strong> {new Date(lastAction.user.membershipStartDate).toLocaleDateString('es-MX', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </span>
                  <span className={lastAction.action === 'checkin' ? 'text-green-700' : 'text-blue-700'}>
                    <strong>Vencimiento:</strong> {new Date(lastAction.user.membershipEndDate).toLocaleDateString('es-MX', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Historial de visitas recientes */}
                {lastAction.user.history && lastAction.user.history.length > 0 && (
                  <div className={`rounded-xl overflow-hidden border ${
                    lastAction.action === 'checkin' ? 'border-green-200' : 'border-blue-200'
                  }`}>
                    <div className={`px-4 py-3 flex items-center gap-2 ${
                      lastAction.action === 'checkin' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <History size={18} className={
                        lastAction.action === 'checkin' ? 'text-green-600' : 'text-blue-600'
                      } />
                      <h4 className={`font-bold ${
                        lastAction.action === 'checkin' ? 'text-green-800' : 'text-blue-800'
                      }`}>
                        Historial de Visitas
                      </h4>
                    </div>
                    <div className="bg-white max-h-48 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Salida</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {lastAction.user.history.map((visit, idx) => (
                            <tr key={idx} className={idx === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                              <td className="px-4 py-2 text-gray-700 font-medium">
                                {formatDate(visit.checkInTime)}
                                {idx === 0 && <span className="ml-2 text-xs text-yellow-600 font-bold">(Hoy)</span>}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                <div className="flex items-center gap-1">
                                  <LogIn size={12} className="text-green-500" />
                                  {formatTime(visit.checkInTime)}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {visit.checkOutTime ? (
                                  <div className="flex items-center gap-1">
                                    <LogOut size={12} className="text-blue-500" />
                                    {formatTime(visit.checkOutTime)}
                                  </div>
                                ) : (
                                  <span className="text-green-600 font-medium flex items-center gap-1">
                                    <Activity size={12} /> En gym
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {formatDuration(visit.duration)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Panel de error */}
            {showError && errorInfo && (
              <div className="p-6 animate-fade-in bg-gradient-to-br from-red-50 to-rose-50 border-b-2 border-red-200">
                {/* Encabezado del error */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-red-400 to-rose-500 text-white">
                      {errorInfo.type === 'membership_expired' ? (
                        <Calendar size={40} />
                      ) : errorInfo.type === 'no_membership' ? (
                        <Award size={40} />
                      ) : (
                        <XCircle size={40} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-red-800">
                        {errorInfo.title}
                      </h3>
                      <p className="text-lg font-medium text-red-600 mt-1">
                        NIP ingresado: <span className="font-mono font-bold">{errorInfo.nip}</span>
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => { setShowError(false); setErrorInfo(null); }}
                    className="p-2 rounded-lg transition-colors hover:bg-red-100 text-red-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Descripción del error */}
                <div className="p-4 rounded-xl bg-red-100/50 border border-red-200 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
                    <div>
                      <p className="text-red-700 font-medium text-lg">
                        {errorInfo.description}
                      </p>
                      {errorInfo.type === 'membership_expired' && (
                        <p className="text-red-600 text-sm mt-2">
                          💡 Diríjase a recepción para renovar su membresía y continuar accediendo al gimnasio.
                        </p>
                      )}
                      {errorInfo.type === 'no_membership' && (
                        <p className="text-red-600 text-sm mt-2">
                          💡 El personal de recepción puede asignarle un plan de membresía.
                        </p>
                      )}
                      {errorInfo.type === 'nip_invalid' && (
                        <p className="text-red-600 text-sm mt-2">
                          💡 Verifique que el NIP sea correcto o consulte con el personal de recepción.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Icono grande de error */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                    <XCircle size={64} className="text-red-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Estadísticas rápidas */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl text-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="text-green-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentlyInGym.length}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    En el gym ahora
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl text-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    <Users className="text-blue-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats?.totalCheckins || 0}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Entradas hoy
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl text-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="text-purple-500" size={24} />
                  </div>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats?.avgDurationMinutes ? formatDuration(stats.avgDurationMinutes) : '-'}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tiempo promedio
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel lateral - Usuarios actualmente en el gym */}
          <div className={`rounded-2xl shadow-xl overflow-hidden ${
            darkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-bold flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <Activity className="text-green-500" size={20} />
                En el gimnasio ahora
                <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {currentlyInGym.length}
                </span>
              </h3>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {currentlyInGym.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    No hay personas en el gimnasio
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentlyInGym.map((person) => (
                    <div 
                      key={person.id}
                      className={`p-4 hover:bg-opacity-50 transition-colors ${
                        darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'
                        }`}>
                          {person.userName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {person.userName}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {person.membership}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {formatDuration(person.minutesInGym)}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            desde {formatTime(person.checkInTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Historial del día */}
        <div className={`mt-6 rounded-2xl shadow-xl overflow-hidden ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Clock size={20} className="text-blue-500" />
              Historial de hoy
            </h3>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {todayCheckins.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Usuario</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Membresía</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Entrada</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Salida</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Estado</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {todayCheckins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Clock className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={48} />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        No hay registros hoy
                      </p>
                    </td>
                  </tr>
                ) : (
                  todayCheckins.map((checkin) => (
                    <tr 
                      key={checkin.id}
                      className={`transition-colors ${
                        darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            {checkin.userName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {checkin.userName}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              NIP: {checkin.userNip}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {checkin.membership}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <LogIn size={14} className="text-green-500" />
                          {formatTime(checkin.checkInTime)}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {checkin.checkOutTime ? (
                          <div className="flex items-center gap-2">
                            <LogOut size={14} className="text-blue-500" />
                            {formatTime(checkin.checkOutTime)}
                          </div>
                        ) : (
                          <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {checkin.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <Activity size={12} />
                            En el gym
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <CheckCircle size={12} />
                            Completado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
