import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Wrench, CheckCircle, AlertTriangle, XCircle, Edit, Trash2, Dumbbell, Settings, Tag, MapPin, X } from 'lucide-react';
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
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Máquinas</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona el equipamiento del gimnasio</p>
        </div>
        {activeTab === 'machines' && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Nueva Máquina
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('machines')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'machines'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Dumbbell size={16} />
            Máquinas
          </div>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Tag size={16} />
            Categorías
          </div>
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'locations'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            Ubicaciones
          </div>
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'machines' && (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Dumbbell className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Disponibles</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.byStatus?.disponible || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Wrench className="text-yellow-600 dark:text-yellow-400" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Mantenimiento</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.byStatus?.mantenimiento || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Necesitan Mant.</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.needMaintenance || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar máquinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Machines Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Máquina</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Ubicación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Próx. Mant.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMachines.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        {machines.length === 0 ? 'No hay máquinas registradas' : 'No se encontraron máquinas'}
                      </td>
                    </tr>
                  ) : (
                    filteredMachines.map((machine) => {
                      const StatusIcon = statusConfig[machine.estado]?.icon || CheckCircle;
                      return (
                        <tr key={machine.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{machine.nombre}</p>
                              {machine.marca && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {machine.marca} {machine.modelo && `- ${machine.modelo}`}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColorByName(machine.categoria)}`}>
                              {machine.categoria}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={machine.estado}
                              onChange={(e) => handleStatusChange(machine, e.target.value)}
                              className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${statusConfig[machine.estado]?.color || 'bg-gray-100'}`}
                            >
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white hidden md:table-cell">
                            {machine.ubicacion || '-'}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {machine.proximo_mantenimiento ? (
                              <span className={new Date(machine.proximo_mantenimiento) <= new Date() ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-white'}>
                                {new Date(machine.proximo_mantenimiento).toLocaleDateString('es-MX')}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleEdit(machine)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(machine)}
                                className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona las categorías para clasificar tus máquinas
            </p>
            <button
              onClick={() => openCategoryModal()}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Nueva Categoría
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Color</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Máquinas</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      No hay categorías registradas
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(cat.color)}`}>
                          {cat.nombre}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${colorOptions.find(c => c.value === cat.color)?.class || 'bg-gray-500'}`}></div>
                          <span className="text-gray-700 dark:text-gray-300 capitalize">{cat.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {stats?.byCategory?.[cat.nombre] || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openCategoryModal(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona las ubicaciones donde se encuentran tus máquinas
            </p>
            <button
              onClick={() => openLocationModal()}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Nueva Ubicación
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Máquinas</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      No hay ubicaciones registradas
                    </td>
                  </tr>
                ) : (
                  locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{loc.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {loc.descripcion || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {machines.filter(m => m.ubicacion === loc.nombre).length}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openLocationModal(loc)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(loc)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={closeCategoryModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={categoryForm.nombre}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color: color.value })}
                      className={`w-8 h-8 rounded-full ${color.class} ${categoryForm.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
              </h3>
              <button onClick={closeLocationModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleLocationSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={locationForm.nombre}
                  onChange={(e) => setLocationForm({ ...locationForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de la ubicación"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                  value={locationForm.descripcion}
                  onChange={(e) => setLocationForm({ ...locationForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                  placeholder="Descripción opcional"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeLocationModal}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
