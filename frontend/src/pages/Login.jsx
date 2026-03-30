import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiCpu } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left side: Image layout */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 relative">
        <div className="absolute inset-0 bg-primary-800/80 z-10 mix-blend-multiply"></div>
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80"
          alt="Technology servers"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-12 w-full max-w-lg">
          <div className="mb-8 flex justify-center">
            <img src="/logo_cantv.png" alt="CANTV Logo" className="h-24 w-auto drop-shadow-lg" />
          </div>
          {/* <h2 className="text-4xl font-bold text-white tracking-tight mb-4 uppercase">CANTV Inventario</h2> */}
          <p className="text-primary-100 text-lg">
            Sistema inteligente y centralizado para la gestión técnica de recursos computacionales de la empresa.
          </p>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h1>
            <p className="text-gray-500">Ingresa tus credenciales para acceder al sistema corporativo.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 outline-none focus:ring-primary-500 focus:border-primary-500 border transition-all"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Contraseña
                </label>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm py-3 px-4 outline-none focus:ring-primary-500 focus:border-primary-500 border transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Recordar en este equipo
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98]"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
