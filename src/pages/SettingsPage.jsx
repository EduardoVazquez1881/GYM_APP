import { useState } from 'react';
import { useDarkMode, useTheme, themes } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Settings, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  User,
  Database,
  Download,
  Palette,
  Shield,
  CheckCircle,
  Check
} from 'lucide-react';

function SettingsPage() {
  const { darkMode } = useDarkMode();
  const { theme, currentTheme, setTheme } = useTheme();
  const { user, changePassword } = useAuth();
  const notification = useNotification();
  
  const [activeTab, setActiveTab] = useState('account');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notification.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      notification.error('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    setSaving(true);
    const result = await changePassword(passwordForm.newPassword);
    setSaving(false);

    if (result.success) {
      notification.success('Contraseña actualizada correctamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      notification.error(result.message || 'Error al cambiar la contraseña');
    }
  };

  const handleExportData = async () => {
    try {
      const users = await window.electron.users.getAll();
      const memberships = await window.electron.memberships.getAll();
      
      const data = {
        exportDate: new Date().toISOString(),
        users,
        memberships
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gym_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notification.success('Datos exportados correctamente');
    } catch (error) {
      notification.error('Error al exportar los datos');
    }
  };

  const tabs = [
    { id: 'account', label: 'Mi Cuenta', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'appearance', label: 'Temas', icon: Palette },
    { id: 'data', label: 'Datos', icon: Database }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600 to-green-600 
                flex items-center justify-center shadow-lg">
                <Settings size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Configuración</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Administra tu cuenta y preferencias del sistema
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-6">
        {/* Sidebar de tabs */}
        <div className={`w-64 rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-medium ${
                    activeTab === tab.id
                      ? darkMode 
                        ? 'bg-teal-900/40 text-teal-300 border-l-4 border-teal-500' 
                        : 'bg-teal-50 text-teal-700 border-l-4 border-teal-600'
                      : darkMode
                        ? 'text-gray-400 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido */}
        <div className={`flex-1 rounded-xl shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="p-8">
            
            {/* Tab: Mi Cuenta */}
            {activeTab === 'account' && (
              <div>
                <h2 className={`text-2xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información de la Cuenta
                </h2>
                
                <div className="space-y-6">
                  {/* Avatar y datos básicos */}
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                      darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {user?.nombre?.slice(0, 2).toUpperCase() || user?.username?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {user?.nombre || user?.username}
                      </h3>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        @{user?.username}
                      </p>
                      <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.rol === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <Shield size={12} />
                        {user?.rol === 'admin' ? 'Administrador' : 'Recepción'}
                      </span>
                    </div>
                  </div>

                  {/* Información de la cuenta */}
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Usuario
                        </p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user?.username}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Rol
                        </p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user?.rol === 'admin' ? 'Administrador' : 'Recepción'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Seguridad */}
            {activeTab === 'security' && (
              <div>
                <h2 className={`text-2xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cambiar Contraseña
                </h2>

                <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
                  {/* Nueva contraseña */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.new 
                          ? <EyeOff size={18} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                          : <Eye size={18} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.confirm 
                          ? <EyeOff size={18} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                          : <Eye size={18} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                        }
                      </button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">Las contraseñas no coinciden</p>
                    )}
                    {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                      <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                        <CheckCircle size={14} /> Las contraseñas coinciden
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
                      saving || !passwordForm.newPassword || !passwordForm.confirmPassword
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Apariencia */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Temas de la Aplicación
                </h2>
                <p className={`mb-8 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Personaliza la apariencia de tu aplicación
                </p>

                {/* Grid de temas */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.values(themes).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        notification.success(`Tema "${t.name}" aplicado`);
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        currentTheme === t.id 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30' 
                          : darkMode 
                            ? 'border-gray-700 hover:border-gray-600' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Indicador de selección */}
                      {currentTheme === t.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}

                      {/* Preview del tema */}
                      <div className={`w-full h-16 rounded-lg mb-3 overflow-hidden ${
                        t.isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        <div className={`h-4 ${t.colors.sidebarBg}`}></div>
                        <div className="flex p-1 gap-1">
                          <div className={`w-6 h-8 rounded ${t.isDark ? 'bg-gray-700' : 'bg-white'}`}></div>
                          <div className="flex-1 space-y-1">
                            <div className={`h-2 w-full rounded ${t.isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                            <div className={`h-2 w-3/4 rounded ${t.isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                          </div>
                        </div>
                      </div>

                      {/* Nombre y emoji */}
                      <div className="text-center">
                        <span className="text-xl mb-1 block">{t.icon}</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t.name}
                        </span>
                        <span className={`block text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {t.isDark ? 'Oscuro' : 'Claro'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Tema actual */}
                <div className={`mt-8 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Palette size={20} />
                    Tema Actual: {theme.name} {theme.icon}
                  </h3>
                  
                  {/* Preview más grande */}
                  <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    {/* Header simulado */}
                    <div className={`h-10 ${theme.colors.sidebarBg} flex items-center px-4 gap-2`}>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    
                    {/* Contenido simulado */}
                    <div className={`flex h-32 ${theme.colors.bgPrimary}`}>
                      {/* Sidebar */}
                      <div className={`w-16 ${theme.colors.sidebarBg} p-2 space-y-2`}>
                        <div className={`w-full h-6 rounded ${theme.isDark ? 'bg-white/10' : 'bg-white/20'}`}></div>
                        <div className={`w-full h-6 rounded ${theme.isDark ? 'bg-white/5' : 'bg-white/10'}`}></div>
                        <div className={`w-full h-6 rounded ${theme.isDark ? 'bg-white/5' : 'bg-white/10'}`}></div>
                      </div>
                      
                      {/* Main content */}
                      <div className="flex-1 p-3 space-y-2">
                        <div className="flex gap-2">
                          <div className={`h-8 w-24 rounded ${theme.colors.accentBg}`}></div>
                          <div className={`h-8 flex-1 rounded ${theme.colors.cardBg}`}></div>
                        </div>
                        <div className={`h-12 rounded ${theme.colors.cardBg}`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Info del tema */}
                  <div className="mt-4 flex items-center gap-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      theme.isDark 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {theme.isDark ? '🌙 Tema Oscuro' : '☀️ Tema Claro'}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Color de acento: {theme.colors.accent}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Datos */}
            {activeTab === 'data' && (
              <div>
                <h2 className={`text-2xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Gestión de Datos
                </h2>

                <div className="space-y-6">
                  {/* Exportar datos */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                        <Download size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          Exportar Datos
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Descarga una copia de todos los usuarios y membresías
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download size={18} />
                      Exportar a JSON
                    </button>
                  </div>

                  {/* Info de la base de datos */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                        <Database size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          Base de Datos
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          SQLite con better-sqlite3
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Los datos se almacenan localmente en tu computadora y están protegidos por el sistema operativo.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default SettingsPage;
