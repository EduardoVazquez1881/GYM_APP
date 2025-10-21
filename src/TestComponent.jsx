import { useState } from 'react'

function TestComponent() {
  const [activo, setActivo] = useState(false)

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        🧪 Componente de Prueba
      </h2>
      <button
        onClick={() => setActivo(!activo)}
        className={`px-6 py-3 rounded-lg font-semibold transition ${
          activo 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-300 text-gray-700'
        }`}
      >
        {activo ? '✅ Activado' : '⚪ Desactivado'}
      </button>
    </div>
  )
}

export default TestComponent