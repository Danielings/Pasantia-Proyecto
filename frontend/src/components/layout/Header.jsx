import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiCpu, FiUser } from 'react-icons/fi';

export default function Header() {
  const getNavClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'text-primary-600 border-primary-600'
        : 'text-gray-500 border-transparent hover:text-primary-600 hover:border-primary-200'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img src="/logo_cantv.png" alt="CANTV Logo" className="h-10 w-auto" />
              {/* <span className="font-bold text-xl text-gray-900 tracking-tight ml-2">CANTV Inventario</span> */}
            </Link>

            {/* Navegación Principal */}
            <nav className="hidden md:flex space-x-4">
              <NavLink to="/dashboard" className={getNavClass}>Inicio</NavLink>
              <NavLink to="/busqueda" className={getNavClass}>Búsqueda</NavLink>
              <NavLink to="/registro" className={getNavClass}>Registro de Equipo</NavLink>
            </nav>
          </div>

          <div className="flex items-center">
            {/* Perfil */}
            <Link
              to="/perfil"
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Perfil de Usuario"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                <FiUser className="text-primary-600 w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
