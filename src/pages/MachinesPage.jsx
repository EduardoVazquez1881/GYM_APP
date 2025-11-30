import { useState, useEffect } from 'react';
import { 
  Dumbbell, Plus, Search, Filter, Edit2, Trash2, 
  Wrench, CheckCircle, AlertTriangle, XCircle,
  Settings, Calendar, MapPin, Tag, Hash
} from 'lucide-react';
import { useDarkMode } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import MachineForm from '../components/MachineForm';
import ConfirmModal from '../components/ConfirmModal';

const ESTADOS = {
  disponible: { label: 'Disponible', color: 'green', icon: CheckCircle },
  en_uso: { label: 'En Uso', color: 'blue', icon: Dumbbell },
  mantenimiento: { label: 'En Mantenimiento', color: 'yellow', icon: Wrench },
  fuera_servicio: { label: 'Fuera de Servicio', color: 'red', icon: XCircle }
};

const CATEGORIAS = [
  'Cardio',
  'Fuerza',
  'Peso Libre',
  'Funcional',
  'Estiramiento',
  'Máquinas de Cable',
  'Otro'
];

export default function MachinesPage() {
  const { darkMode } = useDarkMode();
  const notification = useNotification();
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadMachines();
    loadStats();
  }, []);

  useEffect(() => {
    filterMachines();
  }, [machines, searchTerm, filterCategory, filterStatus]);

  const loadMachines = async () => {
    try {
      setLoading(true);
      const data = await window.electron.machines.getAll();
      setMachines(data);
    } catch (error) {
      notification.error('Error al cargar las máquinas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await window.electron.machines.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterMachines = () => {
    let result = [...machines];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m => 
        m.nombre.toLowerCase().includes(term) ||
        m.marca?.toLowerCase().includes(term) ||
        m.modelo?.toLowerCase().includes(term) ||
        m.ubicacion?.toLowerCase().includes(term)
      );
    }
    
    if (filterCategory) {
      result = result.filter(m => m.categoria === filterCategory);
    }
    
    if (filterStatus) {
      result = result.filter(m => m.estado === filterStatus);
    }
    
    setFilteredMachines(result);
  };

  const handleCreate = async (data) => {
    try {
      await window.electron.machines.create(data);
      notification.success('Máquina creada exitosamente');
      loadMachines();
      loadStats();
      setShowForm(false);
    } catch (error) {
      notification.error('Error al crear la máquina');
      console.error(error);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await window.electron.machines.update(editingMachine.id, data);
      notification.success('Máquina actualizada exitosamente');
      loadMachines();
      loadStats();
      setEditingMachine(null);
      setShowForm(false);
    } catch (error) {
      notification.error('Error al actualizar la máquina');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await window.electron.machines.delete(machineToDelete.id);
      notification.success('Máquina eliminada');
      loadMachines();
      loadStats();
      setShowConfirm(false);
      setMachineToDelete(null);
    } catch (error) {
      notification.error('Error al eliminar la máquina');
      console.error(error);
    }
  };

  const handleStatusChange = async (machine, newStatus) => {
    try {
      await window.electron.machines.updateStatus(machine.id, newStatus);
      notification.success(`Estado actualizado a: ${ESTADOS[newStatus].label}`);
      loadMachines();
      loadStats();
    } catch (error) {
      notification.error('Error al cambiar el estado');
      console.error(error);
    }
  };

  const openEditForm = (machine) => {
    setEditingMachine(machine);
    setShowForm(true);
  };

  const openDeleteConfirm = (machine) => {
    setMachineToDelete(machine);
    setShowConfirm(true);
  };

  const getStatusBadge = (estado) => {
    const config = ESTADOS[estado] || ESTADOS.disponible;
    const Icon = config.icon;
    
    const colors = {
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[config.color]}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 
              flex items-center justify-center shadow-lg">
              <Dumbbell size={28} className="text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Máquinas y Equipos
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Gestiona el equipamiento del gimnasio
              </p>
            </div>
          </div>
          
          <button
            onClick={() => { setEditingMachine(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 
              text-white rounded-xl font-semibold shadow-lg hover:shadow-xl 
              transform hover:-translate-y-0.5 transition-all"
          >
            <Plus size={20} />
            Nueva Máquina
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Dumbbell className="text-orange-600 dark:text-orange-400" size={20} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.total}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Equipos</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.byStatus?.disponible || 0}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Disponibles</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Wrench className="text-yellow-600 dark:text-yellow-400" size={20} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.byStatus?.mantenimiento || 0}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>En Mantenimiento</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.needMaintenance || 0}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Necesitan Revisión</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`} size={20} />
                <input
                  type="text"
                  placeholder="Buscar máquina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-2 transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500'
                      : 'bg-white border-gray-200 focus:border-orange-500'
                  }`}
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-4 py-2.5 rounded-lg border-2 transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-orange-500'
                  : 'bg-white border-gray-200 focus:border-orange-500'
              }`}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2.5 rounded-lg border-2 transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-orange-500'
                  : 'bg-white border-gray-200 focus:border-orange-500'
              }`}
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Machines Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className={`text-center py-12 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
            <Dumbbell className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} size={64} />
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No hay máquinas
            </h3>
            <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
              {machines.length === 0 
                ? 'Agrega tu primera máquina para comenzar' 
                : 'No se encontraron resultados con los filtros actuales'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map((machine) => (
              <div 
                key={machine.id}
                className={`rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl ${
                  darkMode ? 'bg-gray-900' : 'bg-white'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{machine.nombre}</h3>
                      <p className="text-orange-100 text-sm">{machine.categoria}</p>
                    </div>
                    {getStatusBadge(machine.estado)}
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {machine.marca && (
                    <div className="flex items-center gap-2">
                      <Tag size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {machine.marca} {machine.modelo && `- ${machine.modelo}`}
                      </span>
                    </div>
                  )}
                  
                  {machine.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {machine.ubicacion}
                      </span>
                    </div>
                  )}
                  
                  {machine.numero_serie && (
                    <div className="flex items-center gap-2">
                      <Hash size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                      <span className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {machine.numero_serie}
                      </span>
                    </div>
                  )}
                  
                  {machine.proximo_mantenimiento && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={
                        new Date(machine.proximo_mantenimiento) <= new Date() 
                          ? 'text-red-500' 
                          : darkMode ? 'text-gray-500' : 'text-gray-400'
                      } />
                      <span className={`text-sm ${
                        new Date(machine.proximo_mantenimiento) <= new Date()
                          ? 'text-red-500 font-medium'
                          : darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Próx. mant: {new Date(machine.proximo_mantenimiento).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Card Footer */}
                <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    {/* Status Dropdown */}
                    <select
                      value={machine.estado}
                      onChange={(e) => handleStatusChange(machine, e.target.value)}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-gray-300'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {Object.entries(ESTADOS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(machine)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-gray-800 text-gray-400 hover:text-orange-400'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-orange-600'
                        }`}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(machine)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-gray-800 text-gray-400 hover:text-red-400'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'
                        }`}
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <MachineForm
          onClose={() => { setShowForm(false); setEditingMachine(null); }}
          onSubmit={editingMachine ? handleUpdate : handleCreate}
          initialData={editingMachine}
          categories={CATEGORIAS}
        />
      )}

      {/* Confirm Delete Modal */}
      {showConfirm && machineToDelete && (
        <ConfirmModal
          title="Eliminar Máquina"
          message={`¿Estás seguro de eliminar "${machineToDelete.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          confirmColor="red"
          onConfirm={handleDelete}
          onCancel={() => { setShowConfirm(false); setMachineToDelete(null); }}
        />
      )}
    </div>
  );
}
