import React from 'react';
import Header from '../components/layout/Header';
import { FiUser, FiMail, FiShield, FiSettings, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Perfil() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Perfil de Administrador</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tu información de cuenta y preferencias.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: User Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-primary-600 h-24"></div>
              <div className="px-6 pb-6 relative">
                <div className="relative inline-block -mt-12 mb-4">
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="User avatar" 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex cursor-pointer transition-all">
                      <FiEdit2 className="text-white w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-gray-900">Carlos Administrador</h2>
                  <p className="text-sm font-medium text-primary-600 mb-4 whitespace-nowrap">Director de Infraestructura IT</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMail className="mr-3 text-gray-400" />
                      admin@empresa.com
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiShield className="mr-3 text-green-500" />
                      Permisos Totales (Root)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Ajustes de la Cuenta</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notificaciones de Inventario</h4>
                    <p className="text-sm text-gray-500">Recibir alertas por componentes en mal estado o en reparación.</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button type="button" className="bg-primary-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <span className="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Reportes Semanales</h4>
                    <p className="text-sm text-gray-500">Reporte automático en PDF enviado por email.</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button type="button" className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      <span className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                    </button>
                  </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                    <FiSettings className="mr-2 -ml-1 h-4 w-4" />
                    Actualizar Contraseña
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <FiLogOut className="mr-2 -ml-1 h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
