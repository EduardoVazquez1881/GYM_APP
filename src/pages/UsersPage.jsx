import { useState, useEffect } from 'react';
import { Plus, Search, Users as UsersIcon, LayoutGrid, List } from 'lucide-react';
import UserForm from '../components/UserForm';
import UserCard from '../components/UserCard';
import UserTable from '../components/UserTable';
import AssignMembershipModal from '../components/AssignMembershipModal';
import AddMembershipModal from '../components/AddMembershipModal';
import { useDarkMode } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmModal } from '../components/ConfirmModal';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'grid'
  const [loading, setLoading] = useState(true);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showAddMembershipModal, setShowAddMembershipModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { darkMode } = useDarkMode();
  const notification = useNotification();
  const { confirm, ConfirmModal } = useConfirmModal();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await window.electron.users.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      notification.error('Error al cargar los usuarios');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Agregar nuevo usuario
  const handleAddUser = async (userData) => {
    try {
      const newUser = await window.electron.users.create(userData);
      setUsers(prev => [newUser, ...prev]);
      notification.success(`Usuario ${userData.nombre} creado correctamente (NIP: ${newUser.nip})`);
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMsg = error.message || '';
      
      // Mostrar mensaje específico según el error
      if (errorMsg.includes('UNIQUE constraint failed: users.correo')) {
        notification.error('El correo electrónico ya está registrado');
      } else if (errorMsg.includes('UNIQUE constraint failed: users.nip') || errorMsg.includes('NIP ya está en uso')) {
        notification.error('El NIP ya está en uso por otro usuario');
      } else if (errorMsg.includes('UNIQUE constraint failed: users.telefono')) {
        notification.error('El teléfono ya está registrado');
      } else {
        notification.error(errorMsg || 'Error al crear el usuario');
      }
      throw error;
    }
  };

  // Editar usuario
  const handleEditUser = async (userData) => {
    try {
      const updatedUser = await window.electron.users.update(editingUser.id, userData);
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));
      setEditingUser(null);
      notification.success('Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMsg = error.message || '';
      
      // Mostrar mensaje específico según el error
      if (errorMsg.includes('UNIQUE constraint failed: users.correo')) {
        notification.error('El correo electrónico ya está registrado por otro usuario');
      } else if (errorMsg.includes('UNIQUE constraint failed: users.nip') || errorMsg.includes('NIP ya está en uso')) {
        notification.error('El NIP ya está en uso por otro usuario');
      } else if (errorMsg.includes('UNIQUE constraint failed: users.telefono')) {
        notification.error('El teléfono ya está registrado por otro usuario');
      } else {
        notification.error(errorMsg || 'Error al actualizar el usuario');
      }
      throw error;
    }
  };

  // Activar/Desactivar usuario
  const handleToggleActive = async (userToToggle) => {
    const action = userToToggle.activo ? 'desactivar' : 'activar';
    const confirmed = await confirm({
      title: `¿${userToToggle.activo ? 'Desactivar' : 'Activar'} usuario?`,
      message: `¿Estás seguro de ${action} a ${userToToggle.nombre} ${userToToggle.apellidoPaterno}?`,
      confirmText: userToToggle.activo ? 'Desactivar' : 'Activar',
      type: userToToggle.activo ? 'warning' : 'info'
    });

    if (confirmed) {
      try {
        const updatedUser = await window.electron.users.toggleActive(userToToggle.id);
        setUsers(prev => prev.map(user => 
          user.id === userToToggle.id ? updatedUser : user
        ));
        notification.success(`Usuario ${action}do correctamente`);
      } catch (error) {
        console.error('Error toggling user active status:', error);
        notification.error(`Error al ${action} el usuario`);
      }
    }
  };

  // Abrir formulario para editar
  const openEditForm = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Abrir modal de asignación de membresía
  const openMembershipModal = (user) => {
    setSelectedUser(user);
    setShowMembershipModal(true);
  };

  // Asignar membresía
  const handleAssignMembership = async (membershipId, startDate) => {
    try {
      const updatedUser = await window.electron.users.assignMembership(
        selectedUser.id,
        membershipId,
        startDate
      );
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      setShowMembershipModal(false);
      setSelectedUser(null);
      notification.success('Membresía asignada correctamente');
    } catch (error) {
      console.error('Error assigning membership:', error);
      notification.error('Error al asignar la membresía');
    }
  };

  // Abrir modal para añadir membresía
  const handleRenewMembership = (userToRenew) => {
    setSelectedUser(userToRenew);
    setShowAddMembershipModal(true);
  };

  // Procesar adición de membresía
  const handleAddMembership = async (membershipId) => {
    try {
      // Determinar la fecha de inicio para la suma
      // Si la membresía actual está vencida, inicia hoy
      // Si está activa, inicia cuando termina la actual
      const currentMembership = selectedUser?.membership;
      let startDateForAddition = new Date().toISOString().split('T')[0];
      
      if (currentMembership?.endDate) {
        const endDate = new Date(currentMembership.endDate);
        const today = new Date();
        
        // Si la membresía todavía no ha vencido, la nueva empieza cuando termina la actual
        if (endDate > today) {
          startDateForAddition = endDate.toISOString().split('T')[0];
        }
      }
      
      const updatedUser = await window.electron.users.assignMembership(
        selectedUser.id,
        membershipId,
        startDateForAddition
      );
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      setShowAddMembershipModal(false);
      setSelectedUser(null);
      notification.success('Membresía añadida correctamente');
    } catch (error) {
      console.error('Error adding membership:', error);
      notification.error('Error al añadir membresía: ' + error.message);
    }
  };

  // Cerrar formulario
  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMembership, setFilterMembership] = useState('all');
  const [memberships, setMemberships] = useState([]);

  // Cargar membresías para el filtro
  useEffect(() => {
    const loadMemberships = async () => {
      try {
        const all = await window.electron.memberships.getAll();
        setMemberships(all);
      } catch (error) {
        console.error('Error loading memberships:', error);
      }
    };
    loadMemberships();
  }, []);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      user.nombre.toLowerCase().includes(searchLower) ||
      user.apellidoPaterno.toLowerCase().includes(searchLower) ||
      user.apellidoMaterno?.toLowerCase().includes(searchLower) ||
      user.correo.toLowerCase().includes(searchLower) ||
      user.telefono.includes(searchTerm)
    );

    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    const matchesMembership = filterMembership === 'all' || 
      (filterMembership === 'none' && !user.membership) ||
      (user.membership && user.membership.id === parseInt(filterMembership));

    return matchesSearch && matchesStatus && matchesMembership;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 
                flex items-center justify-center shadow-lg">
                <UsersIcon size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Gestión de Usuarios</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {users.length} {users.length === 1 ? 'miembro registrado' : 'miembros registrados'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 
                transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Barra de búsqueda y controles */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors shadow-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-indigo-400'
                  : 'bg-white border-gray-200 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 border-2 rounded-xl outline-none transition-colors shadow-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-400'
                  : 'bg-white border-gray-200 focus:border-indigo-500'
              }`}
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="expired">Expirados</option>
              <option value="pending">Pendientes</option>
            </select>

            <select
              value={filterMembership}
              onChange={(e) => setFilterMembership(e.target.value)}
              className={`px-4 py-3 border-2 rounded-xl outline-none transition-colors shadow-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-indigo-400'
                  : 'bg-white border-gray-200 focus:border-indigo-500'
              }`}
            >
              <option value="all">Todas las Membresías</option>
              {memberships.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
              <option value="none">Sin Membresía</option>
            </select>
          </div>

          {/* Toggle de vista */}
          <div className={`flex items-center gap-2 border-2 rounded-xl p-1 shadow-sm ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={18} />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
          </div>
        </div>

        {/* Vista de usuarios */}
        {filteredUsers.length > 0 ? (
          viewMode === 'table' ? (
            <UserTable
              users={filteredUsers}
              onEdit={openEditForm}
              onToggleActive={handleToggleActive}
              onRenewMembership={handleRenewMembership}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={openEditForm}
                  onToggleActive={handleToggleActive}
                  onAssignMembership={openMembershipModal}
                  onRenewMembership={handleRenewMembership}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {searchTerm ? <Search size={40} className="text-gray-400" /> : <UsersIcon size={40} className="text-gray-400" />}
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza agregando tu primer miembro del gimnasio'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                  text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 
                  transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                <span>Agregar Primer Usuario</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <UserForm
          onClose={closeForm}
          onSubmit={editingUser ? handleEditUser : handleAddUser}
          initialData={editingUser}
        />
      )}

      {/* Modal de asignación de membresía */}
      {showMembershipModal && selectedUser && (
        <AssignMembershipModal
          user={selectedUser}
          onClose={() => {
            setShowMembershipModal(false);
            setSelectedUser(null);
          }}
          onAssign={handleAssignMembership}
        />
      )}

      {/* Modal de adición de membresía */}
      {showAddMembershipModal && selectedUser && (
        <AddMembershipModal
          user={selectedUser}
          onClose={() => {
            setShowAddMembershipModal(false);
            setSelectedUser(null);
          }}
          onAddMembership={handleAddMembership}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmModal />
    </div>
  );
}
