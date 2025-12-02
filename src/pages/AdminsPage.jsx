import { useState, useEffect } from 'react';
import { useDarkMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmModal } from '../components/ConfirmModal';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Shield, 
  ShieldOff, 
  Eye, 
  EyeOff,
  X,
  Save,
  Users
} from 'lucide-react';

function AdminsPage() {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const notification = useNotification();
  const { confirm, ConfirmModal } = useConfirmModal();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    rol: 'admin'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await window.electron.admins.getAll();
      setAdmins(data);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        username: admin.username,
        password: '',
        nombre: admin.nombre,
        rol: admin.rol
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        username: '',
        password: '',
        nombre: '',
        rol: 'admin'
      });
    }
    setError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }

    if (!editingAdmin && !formData.password.trim()) {
      setError('La contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      if (editingAdmin) {
        const updateData = {
          nombre: formData.nombre,
          rol: formData.rol
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        await window.electron.admins.update(editingAdmin.id, updateData);
        notification.success('Usuario actualizado correctamente');
      } else {
        await window.electron.admins.create(formData);
        notification.success('Usuario creado correctamente');
      }
      handleCloseModal();
      loadAdmins();
    } catch (error) {
      setError(error.message || 'Error al guardar el usuario');
      notification.error(error.message || 'Error al guardar el usuario');
    }
  };

  const handleDelete = async (admin) => {
    if (admin.id === user.id) {
      notification.warning('No puedes eliminar tu propia cuenta');
      return;
    }

    const confirmed = await confirm({
      title: '¿Eliminar usuario?',
      message: `¿Estás seguro de eliminar a ${admin.nombre || admin.username}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await window.electron.admins.delete(admin.id);
        notification.success('Usuario eliminado correctamente');
        loadAdmins();
      } catch (error) {
        notification.error(error.message || 'Error al eliminar el usuario');
      }
    }
  };

  const handleToggleActive = async (admin) => {
    if (admin.id === user.id) {
      notification.warning('No puedes desactivar tu propia cuenta');
      return;
    }

    const action = admin.activo ? 'desactivar' : 'activar';
    const confirmed = await confirm({
      title: `¿${admin.activo ? 'Desactivar' : 'Activar'} usuario?`,
      message: `¿Estás seguro de ${action} a ${admin.nombre || admin.username}?`,
      confirmText: admin.activo ? 'Desactivar' : 'Activar',
      type: admin.activo ? 'warning' : 'info'
    });

    if (confirmed) {
      try {
        await window.electron.admins.toggleActive(admin.id);
        notification.success(`Usuario ${action}do correctamente`);
        loadAdmins();
      } catch (error) {
        notification.error(error.message || 'Error al cambiar el estado');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 
                flex items-center justify-center shadow-lg">
                <Shield size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Gestión de Usuarios del Sistema</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {admins.length} {admins.length === 1 ? 'usuario administrador' : 'usuarios administradores'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 
                text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 
                transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <UserPlus size={20} />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
      {/* Table */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Users size={48} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No hay usuarios registrados
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Usuario
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Nombre
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Rol
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Estado
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Último Acceso
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {admins.map((admin) => (
                <tr key={admin.id} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {admin.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {admin.username}
                        </p>
                        {admin.id === user.id && (
                          <span className="text-xs text-indigo-500">(Tú)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {admin.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.rol === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Shield size={12} className="mr-1" />
                      {admin.rol === 'admin' ? 'Administrador' : admin.rol === 'recepcion' ? 'Recepción' : admin.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(admin.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(admin)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-gray-700 text-blue-400' 
                            : 'hover:bg-blue-50 text-blue-600'
                        }`}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(admin)}
                        disabled={admin.id === user.id}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.id === user.id 
                            ? 'opacity-50 cursor-not-allowed' 
                            : darkMode 
                              ? 'hover:bg-gray-700 text-yellow-400' 
                              : 'hover:bg-yellow-50 text-yellow-600'
                        }`}
                        title={admin.activo ? 'Desactivar' : 'Activar'}
                      >
                        {admin.activo ? <ShieldOff size={18} /> : <Shield size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={admin.id === user.id}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.id === user.id 
                            ? 'opacity-50 cursor-not-allowed' 
                            : darkMode 
                              ? 'hover:bg-gray-700 text-red-400' 
                              : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingAdmin ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={handleCloseModal}
                className={`p-1 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingAdmin}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } ${editingAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="usuario123"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contraseña {editingAdmin ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2 pr-12 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff size={20} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                    ) : (
                      <Eye size={20} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                    )}
                  </button>
                </div>
              </div>

              {/* Rol */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rol
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="admin">Administrador</option>
                  <option value="recepcion">Recepción</option>
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingAdmin ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal />
      </div>
      </div>
    </div>
  );
}

export default AdminsPage;
