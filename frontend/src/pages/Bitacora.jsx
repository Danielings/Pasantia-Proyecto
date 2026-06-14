import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import {
  FiSearch,
  FiSliders,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export default function Bitacora() {
  const [bitacora, setBitacora] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBitacora = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/bitacora", {
          withCredentials: true, // Importante si tienes rutas protegidas
        });
        setBitacora(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error cargando bitácora:", error);
        setBitacora([]);
      }
    };
    fetchBitacora();
  }, []);

  // Filtrado reactivo
  const filteredData = bitacora.filter((item) => {
    // Busca en el nombre de usuario o dentro del arreglo de detalles
    const matchesSearch =
      item.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detalles?.some((detalle) =>
        detalle.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesLocation =
      selectedLocation === "" || item.sede === selectedLocation;

    // Filtro por rango de fechas (Ignora las horas para comparar días exactos)
    const itemDate = new Date(item.fecha);
    itemDate.setHours(0, 0, 0, 0);

    const start = fechaInicio ? new Date(fechaInicio + "T00:00:00") : null;
    const end = fechaFin ? new Date(fechaFin + "T23:59:59") : null;

    const matchesDate =
      (!start || itemDate >= start) && (!end || itemDate <= end);

    return matchesSearch && matchesLocation && matchesDate;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
          Bitácora de Actividades
        </h1>

        {/* CONTENEDOR DE BÚSQUEDA Y FILTROS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o detalle del cambio..."
              className="pl-12 w-full bg-slate-50 border-slate-200 rounded-xl py-3 border focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Resetea a página 1 al buscar
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Sede
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas las sedes</option>
                <option value="Torre 30">Torre 30</option>
                <option value="Torre CANTV">Torre CANTV</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setFechaFin(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "ID",
                    "Usuario",
                    "Acción",
                    "Detalles",
                    "Sede",
                    "Fecha",
                    "ID Modificado",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[100px]">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {item.usuario}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-medium whitespace-nowrap">
                        {item.accion}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.detalles && item.detalles.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1">
                            {item.detalles.map((detalle, idx) => (
                              <li key={idx}>{detalle}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 italic">
                            Sin detalles
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {item.sede}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {item.fecha
                          ? new Date(item.fecha).toLocaleString()
                          : "Sin fecha"}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[120px]">
                        {item.id_modificado}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No se encontraron registros en la bitácora.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
