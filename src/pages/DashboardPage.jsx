import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  UserPlus,
  UserCheck,
  UserX,
  RefreshCw,
  Filter,
  ChevronDown,
  Activity,
  BarChart3,
  Zap,
  Timer,
  LayoutGrid,
  ArrowRight
} from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalMemberships: 0,
    activeMemberships: 0,
    usersWithMembership: 0,
    usersWithoutMembership: 0,
    expiringToday: 0,
    expiringSoon: 0,
    expiredMemberships: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    revenue: {
      today: 0,
      week: 0,
      month: 0
    }
  });
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [currentlyInGym, setCurrentlyInGym] = useState([]);
  const [checkinStats, setCheckinStats] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, expiring, expired
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [renewalPending, setRenewalPending] = useState({ expiring: 0, expired: 0 });

  useEffect(() => {
    loadData();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const [usersData, membershipsData, inGymData, statsData] = await Promise.all([
        window.electron.users.getAll(),
        window.electron.memberships.getAll(),
        window.electron.checkins.getCurrentlyInGym(),
        window.electron.checkins.getStats('today')
      ]);
      
      setUsers(usersData);
      setMemberships(membershipsData);
      setCurrentlyInGym(inGymData);
      setCheckinStats(statsData);
      calculateStats(usersData, membershipsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateStats = (usersData, membershipsData) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Estadísticas de usuarios
    const activeUsers = usersData.filter(u => u.activo);
    const inactiveUsers = usersData.filter(u => !u.activo);
    const usersWithMembership = usersData.filter(u => u.membership);
    const usersWithoutMembership = usersData.filter(u => !u.membership);

    // Membresías por vencer
    const expiringToday = usersData.filter(u => {
      if (!u.membership) return false;
      const endDate = new Date(u.membership.endDate);
      return endDate.toDateString() === today.toDateString();
    });

    const expiringSoon = usersData.filter(u => {
      if (!u.membership) return false;
      const daysRemaining = u.membership.daysRemaining;
      return daysRemaining > 0 && daysRemaining <= 7;
    });

    const expiredMemberships = usersData.filter(u => {
      if (!u.membership) return false;
      return u.membership.daysRemaining <= 0;
    });

    // Nuevos usuarios
    const newUsersToday = usersData.filter(u => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= today;
    });

    const newUsersThisWeek = usersData.filter(u => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= weekAgo;
    });

    const newUsersThisMonth = usersData.filter(u => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= monthAgo;
    });

    // Calcular ingresos estimados (basado en membresías activas)
    let revenueToday = 0;
    let revenueWeek = 0;
    let revenueMonth = 0;

    usersData.forEach(u => {
      if (u.membership) {
        const membershipInfo = membershipsData.find(m => m.id === u.membership.id);
        if (membershipInfo) {
          const startDate = new Date(u.membership.startDate);
          if (startDate >= today) revenueToday += membershipInfo.precio;
          if (startDate >= weekAgo) revenueWeek += membershipInfo.precio;
          if (startDate >= monthAgo) revenueMonth += membershipInfo.precio;
        }
      }
    });

    setStats({
      totalUsers: usersData.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      totalMemberships: membershipsData.length,
      activeMemberships: membershipsData.filter(m => m.activo).length,
      usersWithMembership: usersWithMembership.length,
      usersWithoutMembership: usersWithoutMembership.length,
      expiringToday: expiringToday.length,
      expiringSoon: expiringSoon.length,
      expiredMemberships: expiredMemberships.length,
      newUsersToday: newUsersToday.length,
      newUsersThisWeek: newUsersThisWeek.length,
      newUsersThisMonth: newUsersThisMonth.length,
      revenue: {
        today: revenueToday,
        week: revenueWeek,
        month: revenueMonth
      }
    });

    // Calcular renovaciones pendientes
    const expiringUsers = usersData.filter(u => u.membership && u.membership.daysRemaining > 0 && u.membership.daysRemaining <= 7);
    const expiredUsers = usersData.filter(u => u.membership && u.membership.daysRemaining <= 0);
    
    setRenewalPending({
      expiring: expiringUsers.length,
      expired: expiredUsers.length
    });
  };

  // Memoized filtered users para mejor rendimiento
  const filteredUsers = useMemo(() => {
    let filtered = users;

    switch (filter) {
      case 'active':
        filtered = users.filter(u => u.membership && u.membership.daysRemaining > 0);
        break;
      case 'expiring':
        filtered = users.filter(u => u.membership && u.membership.daysRemaining > 0 && u.membership.daysRemaining <= 7);
        break;
      case 'expired':
        filtered = users.filter(u => u.membership && u.membership.daysRemaining <= 0);
        break;
      case 'noMembership':
        filtered = users.filter(u => !u.membership);
        break;
      default:
        filtered = users;
    }

    return filtered.slice(0, 10);
  }, [users, filter]);

  // Memoized membership distribution para gráfico
  const membershipDistribution = useMemo(() => {
    const activeMemberships = memberships.filter(m => m.activo);
    const distribution = activeMemberships.map(membership => {
      const usersWithThis = users.filter(u => u.membership?.id === membership.id).length;
      const percentage = stats.totalUsers > 0 ? (usersWithThis / stats.totalUsers) * 100 : 0;
      return {
        ...membership,
        userCount: usersWithThis,
        percentage
      };
    });

    // Ordenar por cantidad de usuarios
    return distribution.sort((a, b) => b.userCount - a.userCount);
  }, [memberships, users, stats.totalUsers]);

  // Calcular el máximo para las barras del gráfico
  const maxUsers = useMemo(() => {
    const max = Math.max(...membershipDistribution.map(m => m.userCount), stats.usersWithoutMembership);
    return max || 1;
  }, [membershipDistribution, stats.usersWithoutMembership]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, subValue, trend }) => (
    <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subValue && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${
              trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {trend === 'up' && <TrendingUp size={14} />}
              {trend === 'down' && <TrendingDown size={14} />}
              {subValue}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ title, count, icon: Icon, color, bgColor }) => (
    <div className={`p-4 rounded-xl flex items-center gap-4 ${bgColor}`}>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count}</p>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 
                flex items-center justify-center shadow-lg">
                <LayoutGrid size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Dashboard</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stats.totalUsers} {stats.totalUsers === 1 ? 'usuario activo' : 'usuarios activos'} en el sistema
                </p>
              </div>
            </div>
            
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 
                transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          subValue={`+${stats.newUsersThisMonth} este mes`}
          trend="up"
        />
        <StatCard
          title="Membresías Activas"
          value={stats.usersWithMembership}
          icon={CreditCard}
          color="bg-green-500"
          subValue={`${stats.usersWithoutMembership} sin membresía`}
        />
        <StatCard
          title="Por Vencer (7 días)"
          value={stats.expiringSoon}
          icon={AlertTriangle}
          color="bg-yellow-500"
          subValue={`${stats.expiringToday} vencen hoy`}
          trend={stats.expiringSoon > 0 ? 'down' : undefined}
        />
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(stats.revenue.month)}
          icon={DollarSign}
          color="bg-purple-500"
          subValue={`${formatCurrency(stats.revenue.today)} hoy`}
          trend="up"
        />
      </div>

      {/* Alertas y resumen rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Alertas */}
        <div className={`col-span-1 p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Activity size={20} />
            Resumen del Día
          </h2>
          <div className="space-y-3">
            <AlertCard
              title="Vencen Hoy"
              count={stats.expiringToday}
              icon={Clock}
              color="bg-orange-500"
              bgColor={darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}
            />
            <AlertCard
              title="Membresías Vencidas"
              count={stats.expiredMemberships}
              icon={UserX}
              color="bg-red-500"
              bgColor={darkMode ? 'bg-red-900/30' : 'bg-red-50'}
            />
            <AlertCard
              title="Nuevos Hoy"
              count={stats.newUsersToday}
              icon={UserPlus}
              color="bg-green-500"
              bgColor={darkMode ? 'bg-green-900/30' : 'bg-green-50'}
            />
            <AlertCard
              title="Usuarios Activos"
              count={stats.activeUsers}
              icon={UserCheck}
              color="bg-blue-500"
              bgColor={darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}
            />
          </div>
        </div>

        {/* Gráfico de membresías (representación visual simple) */}
        <div className={`col-span-2 p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <BarChart3 size={20} />
            Distribución de Membresías
          </h2>
          
          {/* Gráfico de barras horizontal mejorado */}
          <div className="space-y-4">
            {membershipDistribution.map((membership, index) => {
              const barWidth = maxUsers > 0 ? (membership.userCount / maxUsers) * 100 : 0;
              const colors = [
                'from-indigo-500 to-purple-500',
                'from-emerald-500 to-teal-500',
                'from-orange-500 to-amber-500',
                'from-pink-500 to-rose-500',
                'from-cyan-500 to-blue-500'
              ];
              
              return (
                <div key={membership.id} className="group">
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {membership.nombre}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {membership.userCount} usuarios ({membership.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className={`w-full h-4 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-4 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-700 ease-out group-hover:opacity-80`}
                      style={{ 
                        width: `${barWidth}%`,
                        animation: 'progress-bar 1s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {/* Sin membresía */}
            <div className="group">
              <div className="flex justify-between mb-1">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sin Membresía
                </span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stats.usersWithoutMembership} usuarios ({stats.totalUsers > 0 ? ((stats.usersWithoutMembership / stats.totalUsers) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className={`w-full h-4 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-4 rounded-full bg-gray-400 transition-all duration-700 ease-out group-hover:opacity-80"
                  style={{ 
                    width: `${maxUsers > 0 ? (stats.usersWithoutMembership / maxUsers) * 100 : 0}%`,
                    animation: 'progress-bar 1s ease-out'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Estadísticas de ingresos */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hoy</p>
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.revenue.today)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Esta Semana</p>
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.revenue.week)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Este Mes</p>
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.revenue.month)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usuarios actualmente en el gym + Estadísticas de asistencia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Usuarios en el gym */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`font-semibold flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Zap className="text-green-500" size={20} />
              En el gimnasio ahora
            </h3>
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {currentlyInGym.length}
            </span>
          </div>
          
          <div className="max-h-[250px] overflow-y-auto">
            {currentlyInGym.length === 0 ? (
              <div className="p-6 text-center">
                <Users className={`mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={40} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay nadie en el gym
                </p>
              </div>
            ) : (
              <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {currentlyInGym.slice(0, 5).map((person) => (
                  <div 
                    key={person.id}
                    className={`p-3 hover:bg-opacity-50 transition-colors ${
                      darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600'
                      }`}>
                        {person.userName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {person.userName}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {person.minutesInGym < 60 
                            ? `${person.minutesInGym} min`
                            : `${Math.floor(person.minutesInGym / 60)}h ${person.minutesInGym % 60}m`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {currentlyInGym.length > 5 && (
                  <div className={`p-3 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="text-xs">+{currentlyInGym.length - 5} más</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas de asistencia */}
        <div className={`col-span-2 rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Timer size={20} className="text-blue-500" />
              Asistencia de Hoy
            </h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {checkinStats?.totalCheckins || 0}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Check-ins totales
                </p>
              </div>
              <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {checkinStats?.uniqueUsers || 0}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Usuarios únicos
                </p>
              </div>
              <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {checkinStats?.avgDurationMinutes || 0}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Min. promedio
                </p>
              </div>
              <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-amber-50'}`}>
                <p className={`text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  {currentlyInGym.length}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ahora en gym
                </p>
              </div>
            </div>

            {/* Horas pico */}
            {checkinStats?.peakHours?.length > 0 && (
              <div className="mt-4">
                <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Horas más populares hoy:
                </p>
                <div className="flex flex-wrap gap-2">
                  {checkinStats.peakHours.map((peak, idx) => (
                    <span 
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        idx === 0 
                          ? 'bg-green-100 text-green-700'
                          : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {peak.hour} ({peak.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Widget de Renovaciones Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Membresías por Vencer */}
        <div className={`rounded-xl shadow-lg overflow-hidden border-l-4 border-yellow-500 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <AlertCircle size={24} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Por Vencer Pronto
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Próximos 7 días
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {renewalPending.expiring}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {renewalPending.expiring > 0 ? (
              <button
                onClick={() => navigate('/usuarios?filter=expiring')}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  darkMode 
                    ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50' 
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                <span>Ver Renovaciones</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <div className="text-center py-4">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ¡Todo en orden! No hay membresías por vencer.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Membresías Vencidas */}
        <div className={`rounded-xl shadow-lg overflow-hidden border-l-4 border-red-500 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <UserX size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Membresías Vencidas
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Requieren renovación inmediata
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {renewalPending.expired}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {renewalPending.expired > 0 ? (
              <button
                onClick={() => navigate('/usuarios?filter=expired')}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  darkMode 
                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <span>Gestionar Renovaciones</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <div className="text-center py-4">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ¡Excelente! No hay membresías vencidas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de usuarios recientes */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Usuarios
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`appearance-none pl-4 pr-10 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">Todos</option>
                  <option value="active">Con Membresía Activa</option>
                  <option value="expiring">Por Vencer</option>
                  <option value="expired">Membresía Vencida</option>
                  <option value="noMembership">Sin Membresía</option>
                </select>
                <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Usuario
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Membresía
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Estado
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Vencimiento
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Días Restantes
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      No hay usuarios que coincidan con el filtro
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {userItem.nombre?.charAt(0)}{userItem.apellidoPaterno?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {userItem.nombre} {userItem.apellidoPaterno}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {userItem.correo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {userItem.membership?.nombre || (
                        <span className="text-gray-400 italic">Sin membresía</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userItem.membership ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userItem.membership.daysRemaining > 7
                            ? 'bg-green-100 text-green-800'
                            : userItem.membership.daysRemaining > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userItem.membership.daysRemaining > 7
                            ? 'Activa'
                            : userItem.membership.daysRemaining > 0
                            ? 'Por vencer'
                            : 'Vencida'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {userItem.membership ? formatDate(userItem.membership.endDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userItem.membership ? (
                        <span className={`font-medium ${
                          userItem.membership.daysRemaining > 7
                            ? 'text-green-500'
                            : userItem.membership.daysRemaining > 0
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}>
                          {userItem.membership.daysRemaining > 0 
                            ? `${userItem.membership.daysRemaining} días`
                            : 'Vencida'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className={`px-6 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default DashboardPage;
