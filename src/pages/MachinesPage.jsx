import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Wrench, CheckCircle, AlertTriangle, XCircle, Edit, Trash2, Dumbbell, Settings, Tag, MapPin, X } from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';
import MachineForm from '../components/MachineForm';

const statusConfig = {
  disponible: { label: 'Disponible', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
  en_uso: { label: 'En Uso', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Dumbbell },
  mantenimiento: { label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Wrench },
  fuera_servicio: { label: 'Fuera de Servicio', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle }
};

const colorOptions = [
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'purple', label: 'Morado', class: 'bg-purple-500' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'teal', label: 'Verde Azulado', class: 'bg-teal-500' },
  { value: 'cyan', label: 'Cian', class: 'bg-cyan-500' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' },
  { value: 'gray', label: 'Gris', class: 'bg-gray-500' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' }
];

const getCategoryColor = (color) => {
  const colorMap = {
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  };
  return colorMap[color] || colorMap.gray;
};

export default function MachinesPage() {
  const { darkMode } = useDarkMode();
  const [machines, setMachines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [error, setError] = useState(null);
  
  // Tabs y modales para gestionar categorías/ubicaciones
  const [activeTab, setActiveTab] = useState('machines');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ nombre: '', color: 'gray' });
  const [locationForm, setLocationForm] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [machinesData, categoriesData, locationsData, statsData] = await Promise.all([
        window.electron.machines.getAll(),
        window.electron.machines.getCategories(),
        window.electron.machines.getLocations(),
        window.electron.machines.getStats()
      ]);
      setMachines(machinesData);
      setCategories(categoriesData);
      setLocations(locationsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading machines:', err);
      setError('Error al cargar las máquinas');
    } finally {
      setLoading(false);
    }
  };

  // ========== Máquinas ==========
  const handleCreate = () => {
    setEditingMachine(null);
    setShowForm(true);
  };

  const handleEdit = (machine) => {
    setEditingMachine(machine);
    setShowForm(true);
  };

  const handleDelete = async (machine) => {
    if (window.confirm(`¿Estás seguro de eliminar "${machine.nombre}"?`)) {
      try {
        await window.electron.machines.delete(machine.id);
        loadData();
      } catch (err) {
        console.error('Error deleting machine:', err);
        setError('Error al eliminar la máquina');
      }
    }
  };

  const handleStatusChange = async (machine, newStatus) => {
    try {
      await window.electron.machines.toggleStatus(machine.id, newStatus);
      loadData();
    } catch (err) {
      console.error('Error changing status:', err);
      setError('Error al cambiar el estado');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMachine) {
        await window.electron.machines.update(editingMachine.id, formData);
      } else {
        await window.electron.machines.create(formData);
      }
      setShowForm(false);
      setEditingMachine(null);
      loadData();
    } catch (err) {
      console.error('Error saving machine:', err);
      throw err;
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMachine(null);
  };

  // ========== Categorías ==========
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ nombre: category.nombre, color: category.color || 'gray' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ nombre: '', color: 'gray' });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ nombre: '', color: 'gray' });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.nombre.trim()) return;
    
    try {
      if (editingCategory) {
        await window.electron.machines.updateCategory(editingCategory.id, categoryForm);
      } else {
        await window.electron.machines.createCategory(categoryForm);
      }
      closeCategoryModal();
      loadData();
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Error al guardar la categoría');
    }
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${category.nombre}"?`)) {
      try {
        await window.electron.machines.deleteCategory(category.id);
        loadData();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Error al eliminar la categoría');
      }
    }
  };

  // ========== Ubicaciones ==========
  const openLocationModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({ nombre: location.nombre, descripcion: location.descripcion || '' });
    } else {
      setEditingLocation(null);
      setLocationForm({ nombre: '', descripcion: '' });
    }
    setShowLocationModal(true);
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
    setEditingLocation(null);
    setLocationForm({ nombre: '', descripcion: '' });
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!locationForm.nombre.trim()) return;
    
    try {
      if (editingLocation) {
        await window.electron.machines.updateLocation(editingLocation.id, locationForm);
      } else {
        await window.electron.machines.createLocation(locationForm);
      }
      closeLocationModal();
      loadData();
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Error al guardar la ubicación');
    }
  };

  const handleDeleteLocation = async (location) => {
    if (window.confirm(`¿Estás seguro de eliminar la ubicación "${location.nombre}"?`)) {
      try {
        await window.electron.machines.deleteLocation(location.id);
        loadData();
      } catch (err) {
        console.error('Error deleting location:', err);
        setError('Error al eliminar la ubicación');
      }
    }
  };

  // Filtrar máquinas
  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (machine.marca && machine.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (machine.modelo && machine.modelo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || machine.categoria === filterCategory;
    const matchesStatus = !filterStatus || machine.estado === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Encontrar color de categoría
  const getCategoryColorByName = (categoryName) => {
    const cat = categories.find(c => c.nombre === categoryName);
    return cat ? getCategoryColor(cat.color) : getCategoryColor('gray');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 
                flex items-center justify-center shadow-lg">
                <Dumbbell size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Gestión de Máquinas</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {machines.length} {machines.length === 1 ? 'máquina registrada' : 'máquinas registradas'}
                </p>
              </div>
            </div>
            
            {activeTab === 'machines' && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 
                  text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 
                  transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Nueva Máquina</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('machines')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'machines'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Dumbbell size={16} />
          Máquinas
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Tag size={16} />
          Categorías
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'locations'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <MapPin size={16} />
          Ubicaciones
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'machines' && (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`rounded-xl p-4 shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Dumbbell className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl p-4 shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Disponibles</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.byStatus?.disponible || 0}</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl p-4 shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Wrench className="text-yellow-600 dark:text-yellow-400" size={24} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mantenimiento</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.byStatus?.mantenimiento || 0}</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl p-4 shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Necesitan Mant.</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.needMaintenance || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className={`rounded-xl p-4 shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar máquinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-3 rounded-lg border-2 outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  }`}
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-4 py-3 rounded-lg border-2 outline-none transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                }`}
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-3 rounded-lg border-2 outline-none transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                }`}
              >
                <option value="">Todos los estados</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Machines Table */}
          <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Máquina</th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Categoría</th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estado</th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ubicación</th>
                    <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Próx. Mant.</th>
                    <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acciones</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                  {filteredMachines.length === 0 ? (
                    <tr>
                      <td colSpan="6" className={`px-6 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {machines.length === 0 ? 'No hay máquinas registradas' : 'No se encontraron máquinas'}
                      </td>
                    </tr>
                  ) : (
                    filteredMachines.map((machine) => {
                      const StatusIcon = statusConfig[machine.estado]?.icon || CheckCircle;
                      return (
                        <tr key={machine.id} className={darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                          <td className={`px-6 py-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{machine.nombre}</p>
                              {machine.marca && (
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {machine.marca} {machine.modelo && `- ${machine.modelo}`}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getCategoryColorByName(machine.categoria)}`}>
                              {machine.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={machine.estado}
                              onChange={(e) => handleStatusChange(machine, e.target.value)}
                              className={`text-xs font-medium rounded-lg px-3 py-1 border-0 cursor-pointer ${statusConfig[machine.estado]?.color || 'bg-gray-100'}`}
                            >
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className={`px-6 py-4 hidden md:table-cell ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {machine.ubicacion || '-'}
                          </td>
                          <td className={`px-6 py-4 hidden lg:table-cell ${
                            machine.proximo_mantenimiento && new Date(machine.proximo_mantenimiento) <= new Date()
                              ? 'text-red-600 dark:text-red-400 font-medium'
                              : darkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {machine.proximo_mantenimiento ? (
                              new Date(machine.proximo_mantenimiento).toLocaleDateString('es-MX')
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(machine)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode
                                    ? 'text-blue-400 hover:bg-blue-900/30'
                                    : 'text-blue-600 hover:bg-blue-100'
                                }`}
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(machine)}
                                className={`p-2 rounded-lg transition-colors ${
                                  darkMode
                                    ? 'text-red-400 hover:bg-red-900/30'
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona las categorías para clasificar tus máquinas
            </p>
            <button
              onClick={() => openCategoryModal()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 
                transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              <span>Nueva Categoría</span>
            </button>
          </div>
          
          <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <table className="w-full text-sm">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Color</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Máquinas</th>
                  <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={`px-6 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No hay categorías registradas
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className={darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(cat.color)}`}>
                          {cat.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-lg shadow-sm ${colorOptions.find(c => c.value === cat.color)?.class || 'bg-gray-500'}`}></div>
                          <span className={`text-sm capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cat.color}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {stats?.byCategory?.[cat.nombre] || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openCategoryModal(cat)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? 'text-purple-400 hover:bg-purple-900/30'
                                : 'text-purple-600 hover:bg-purple-100'
                            }`}
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? 'text-red-400 hover:bg-red-900/30'
                                : 'text-red-600 hover:bg-red-100'
                            }`}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestiona las ubicaciones donde se encuentran tus máquinas
            </p>
            <button
              onClick={() => openLocationModal()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 
                text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 
                transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              <span>Nueva Ubicación</span>
            </button>
          </div>
          
          <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <table className="w-full text-sm">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Descripción</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Máquinas</th>
                  <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={`px-6 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No hay ubicaciones registradas
                    </td>
                  </tr>
                ) : (
                  locations.map((loc) => (
                    <tr key={loc.id} className={darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                            <MapPin size={18} className={darkMode ? 'text-orange-400' : 'text-orange-600'} />
                          </div>
                          <span className="font-medium">{loc.nombre}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {loc.descripcion || '-'}
                      </td>
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          darkMode
                            ? 'bg-orange-900/30 text-orange-300'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {machines.filter(m => m.ubicacion === loc.nombre).length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openLocationModal(loc)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? 'text-orange-400 hover:bg-orange-900/30'
                                : 'text-orange-600 hover:bg-orange-100'
                            }`}
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(loc)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? 'text-red-400 hover:bg-red-900/30'
                                : 'text-red-600 hover:bg-red-100'
                            }`}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Machine Form Modal */}
      {showForm && (
        <MachineForm
          machine={editingMachine}
          categories={categories}
          locations={locations}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md m-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={closeCategoryModal} className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
                <input
                  type="text"
                  value={categoryForm.nombre}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                  }`}
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color</label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color: color.value })}
                      className={`w-10 h-10 rounded-lg transition-all transform hover:scale-110 ${color.class} ${
                        categoryForm.color === color.value 
                          ? 'ring-2 ring-offset-2 ring-purple-500' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md m-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
              </h3>
              <button onClick={closeLocationModal} className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleLocationSubmit} className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
                <input
                  type="text"
                  value={locationForm.nombre}
                  onChange={(e) => setLocationForm({ ...locationForm, nombre: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                  }`}
                  placeholder="Nombre de la ubicación"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
                <textarea
                  value={locationForm.descripcion}
                  onChange={(e) => setLocationForm({ ...locationForm, descripcion: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors resize-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-orange-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                  }`}
                  rows="4"
                  placeholder="Descripción opcional"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeLocationModal}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
