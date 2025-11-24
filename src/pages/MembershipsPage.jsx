import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard, LayoutGrid, List } from 'lucide-react';
import MembershipForm from '../components/MembershipForm';
import MembershipCard from '../components/MembershipCard';
import MembershipTable from '../components/MembershipTable';
import { useDarkMode } from '../context/DarkModeContext';

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(true);
  const { darkMode } = useDarkMode();

  // Cargar membresías al montar el componente
  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    try {
      setLoading(true);
      const allMemberships = await window.electron.memberships.getAll();
      setMemberships(allMemberships);
    } catch (error) {
      console.error('Error loading memberships:', error);
      setMemberships([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Agregar nueva membresía
  const handleAddMembership = async (membershipData) => {
    try {
      const newMembership = await window.electron.memberships.create(membershipData);
      setMemberships(prev => [newMembership, ...prev]);
    } catch (error) {
      console.error('Error creating membership:', error);
    }
  };

  // Editar membresía
  const handleEditMembership = async (membershipData) => {
    try {
      const updatedMembership = await window.electron.memberships.update(editingMembership.id, membershipData);
      setMemberships(prev => prev.map(membership => 
        membership.id === editingMembership.id ? updatedMembership : membership
      ));
      setEditingMembership(null);
    } catch (error) {
      console.error('Error updating membership:', error);
    }
  };

  // Activar/Desactivar membresía
  const handleToggleActive = async (membershipToToggle) => {
    const action = membershipToToggle.activo ? 'desactivar' : 'activar';
    if (window.confirm(`¿Estás seguro de ${action} la membresía "${membershipToToggle.nombre}"?`)) {
      try {
        const updatedMembership = await window.electron.memberships.toggleActive(membershipToToggle.id);
        setMemberships(prev => prev.map(membership => 
          membership.id === membershipToToggle.id ? updatedMembership : membership
        ));
      } catch (error) {
        console.error('Error toggling membership active status:', error);
      }
    }
  };

  // Abrir formulario para editar
  const openEditForm = (membership) => {
    setEditingMembership(membership);
    setShowForm(true);
  };

  // Cerrar formulario
  const closeForm = () => {
    setShowForm(false);
    setEditingMembership(null);
  };

  // Filtrar membresías por búsqueda
  const filteredMemberships = memberships.filter(membership => {
    const searchLower = searchTerm.toLowerCase();
    return (
      membership.nombre.toLowerCase().includes(searchLower) ||
      membership.descripcion?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando membresías...</p>
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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 
                flex items-center justify-center shadow-lg">
                <CreditCard size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Gestión de Membresías</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {memberships.length} {memberships.length === 1 ? 'paquete disponible' : 'paquetes disponibles'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 
                text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 
                transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              <span>Nueva Membresía</span>
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
              placeholder="Buscar membresías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl outline-none transition-colors shadow-sm ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-emerald-400'
                  : 'bg-white border-gray-200 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Toggle de vista */}
          <div className={`flex items-center gap-2 border-2 rounded-xl p-1 shadow-sm ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
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
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
          </div>
        </div>

        {/* Vista de membresías */}
        {filteredMemberships.length > 0 ? (
          viewMode === 'table' ? (
            <MembershipTable
              memberships={filteredMemberships}
              onEdit={openEditForm}
              onToggleActive={handleToggleActive}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemberships.map(membership => (
                <MembershipCard
                  key={membership.id}
                  membership={membership}
                  onEdit={openEditForm}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              {searchTerm ? <Search size={40} className="text-gray-400" /> : <CreditCard size={40} className="text-gray-400" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No se encontraron membresías' : 'No hay membresías registradas'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza creando tu primer paquete de membresía'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 
                  text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 
                  transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                <span>Crear Primera Membresía</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <MembershipForm
          onClose={closeForm}
          onSubmit={editingMembership ? handleEditMembership : handleAddMembership}
          initialData={editingMembership}
        />
      )}
    </div>
  );
}
