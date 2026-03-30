import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { FiSave, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    serial: '',
    type: 'Teclado',
    status: 'Funcional',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for saving would go here
    navigate('/busqueda');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-primary-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Registro de Nuevo Equipo</h1>
            <p className="text-primary-100 text-sm mt-1">Ingresa los detalles técnicos del componente al inventario general.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Equipo / Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm border transition-colors outline-none"
                    placeholder="Ej. Logitech G Pro X"
                  />
                </div>

                <div>
                  <label htmlFor="serial" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Serie (S/N) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="serial"
                    required
                    value={formData.serial}
                    onChange={(e) => setFormData({...formData, serial: e.target.value})}
                    className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm border transition-colors outline-none font-mono"
                    placeholder="SN-XXXXX-XXXX"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Componente <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm border transition-colors outline-none bg-white"
                  >
                    <option value="Teclado">Teclado</option>
                    <option value="Mouse">Mouse</option>
                    <option value="Monitor">Monitor</option>
                    <option value="CPU">CPU</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Estado Actual
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        id="status-funcional"
                        name="status"
                        type="radio"
                        checked={formData.status === 'Funcional'}
                        onChange={() => setFormData({...formData, status: 'Funcional'})}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                      />
                      <label htmlFor="status-funcional" className="ml-2 block text-sm font-medium text-gray-700">
                        Funcional
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="status-no-funcional"
                        name="status"
                        type="radio"
                        checked={formData.status === 'No Funcional'}
                        onChange={() => setFormData({...formData, status: 'No Funcional'})}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300"
                      />
                      <label htmlFor="status-no-funcional" className="ml-2 block text-sm font-medium text-gray-700">
                        No Funcional
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description / Textarea */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Notas / Observaciones
              </label>
              <textarea
                id="description"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm border transition-colors outline-none"
                placeholder="Detalles sobre asignación o desgaste físico..."
              ></textarea>
            </div>

            <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <FiX className="mr-2 -ml-1 h-4 w-4" />
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <FiSave className="mr-2 -ml-1 h-4 w-4" />
                Guardar Equipo
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
