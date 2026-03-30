import React from 'react';
import Header from '../components/layout/Header';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FiMonitor, FiCpu, FiMousePointer, FiDatabase, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const hardwareData = [
  { name: 'Teclados', total: 45, disponibles: 40 },
  { name: 'Mouse', total: 50, disponibles: 48 },
  { name: 'Monitores', total: 35, disponibles: 30 },
  { name: 'CPUs', total: 25, disponibles: 22 },
  { name: 'Laptops', total: 15, disponibles: 10 },
];

const statusData = [
  { name: 'Funcional', value: 150 },
  { name: 'En Reparación', value: 12 },
  { name: 'Inactivo', value: 8 },
];
const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen general del inventario tecnológico.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Equipos</p>
              <h3 className="text-3xl font-bold text-gray-900">170</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiDatabase className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Activos / Funcionales</p>
              <h3 className="text-3xl font-bold text-green-600">150</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">En Reparación</p>
              <h3 className="text-3xl font-bold text-yellow-600">12</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Laptops Asignadas</p>
              <h3 className="text-3xl font-bold text-primary-600">15</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiMonitor className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Equipos por Categoría</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hardwareData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total Inventario" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disponibles" name="Disponibles" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Estado General</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
