import React, { useState } from "react";
import Header from "../components/layout/Header";
import { FiSave, FiX } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    serial: "",
    type: "",
    status: "Funcional",
    description: "",
    ram: "",
    ramSerial: "",
    processor: "",
    storage: "",
    storageSerial: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for saving would go here
    navigate("/busqueda");
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleSearchSerial = (serialField, capacityField, statusField) => {
    const serialValue = formData[serialField];

    if (serialValue === "SN-EXISTENTE") {
      setFormData((prev) => ({
        ...prev,
        [capacityField]: "8GB DDR3", // Lo que venga del sistema
        [statusField]: "Funcional",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-primary-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">
              Registro de Nuevo Equipo
            </h1>
            <p className="text-primary-100 text-sm mt-1">
              Ingresa los detalles técnicos del componente al inventario
              general.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* SECCIÓN 1: Selector de Tipo Centrado */}
            <div className="flex flex-col items-center pb-8 border-b border-gray-100">
              <label
                htmlFor="type"
                className="block text-sm font-semibold text-primary-900 mb-3 uppercase tracking-wider"
              >
                ¿Qué tipo de equipo deseas registrar?
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="block w-full max-w-md border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg border transition-all outline-none bg-white text-center cursor-pointer"
              >
                <option value="">-- Selecciona una opción --</option>
                <option value="Teclado">Teclado</option>
                <option value="Mouse">Mouse</option>
                <option value="Monitor">Monitor</option>
                <option value="CPU">CPU</option>
                <option value="Laptop">Laptop</option>
              </select>
            </div>

            {/* SECCIÓN 2: Campos Dinámicos */}
            {formData.type && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Modelo / Marca */}
                  {formData.type !== "Teclado" && formData.type !== "Mouse" && (
                    <div className="col-span-full md:col-span-1">
                      <label className="block text-sm font-bold text-black mb-2">
                        Modelo / Marca del {formData.type}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-primary-500 text-base border outline-none bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          -- Selecciona el modelo --
                        </option>
                        <option value="Vit">Vit</option>
                        <option value="Lenovo">Lenovo</option>
                        {formData.type !== "CPU" &&
                          formData.type !== "Laptop" && (
                            <>
                              <option value="Dell">Dell</option>
                              <option value="HP">HP</option>
                            </>
                          )}
                      </select>
                    </div>
                  )}

                  {/* Serial General */}
                  <div
                    className={
                      formData.type === "Teclado" || formData.type === "Mouse"
                        ? "col-span-full"
                        : "col-span-full md:col-span-1"
                    }
                  >
                    <label className="block text-sm font-bold text-black mb-2">
                      Número de Serie del Equipo (S/N){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 border outline-none font-mono focus:ring-primary-500 text-sm"
                      placeholder="SN-XXXXX-XXXX"
                      value={formData.serial}
                      onChange={(e) =>
                        setFormData({ ...formData, serial: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* BLOQUE ESPECÍFICO DE COMPONENTES (Solo CPU / Laptop) */}
                {(formData.type === "CPU" || formData.type === "Laptop") && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
                      Componentes Internos
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      {/* BLOQUE DINÁMICO: RAM Y DISCO DURO */}
                      {[
                        {
                          label: "Memoria RAM",
                          capKey: "ram",
                          serKey: "ramSerial",
                          statKey: "ramStatus",
                        },
                        {
                          label: "Disco Duro",
                          capKey: "storage",
                          serKey: "storageSerial",
                          statKey: "storageStatus",
                        },
                      ].map((comp) => (
                        <div
                          key={comp.capKey}
                          className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            {/* Serial + Buscador */}
                            <div className="md:col-span-6">
                              <label className="block text-xs font-bold text-black mb-1 uppercase">
                                Serial de {comp.label}
                              </label>
                              <div className="relative flex">
                                <input
                                  type="text"
                                  className="w-full border-gray-300 rounded-l-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                                  placeholder="S/N del componente..."
                                  value={formData[comp.serKey]}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      [comp.serKey]: e.target.value,
                                    })
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSearchSerial(
                                      comp.serKey,
                                      comp.capKey,
                                      comp.statKey,
                                    )
                                  }
                                  className="bg-primary-600 text-white px-3 rounded-r-md hover:bg-primary-700 transition-colors flex items-center justify-center"
                                >
                                  <CiSearch size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Capacidad */}
                            <div className="md:col-span-3">
                              <label className="block text-xs font-bold text-black mb-1 uppercase">
                                Capacidad
                              </label>
                              <input
                                type="text"
                                className="w-full border-gray-300 rounded-md py-1.5 px-3 text-sm border outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                                placeholder="Ej: 8GB / 500GB"
                                value={formData[comp.capKey]}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [comp.capKey]: e.target.value,
                                  })
                                }
                              />
                            </div>

                            {/* Estados Checkbox */}
                            <div className="md:col-span-3 flex justify-around items-center bg-white border border-gray-200 rounded-md py-1 px-2 h-[38px]">
                              <label className="flex items-center space-x-1 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  checked={
                                    formData[comp.statKey] === "Funcional"
                                  }
                                  onChange={() =>
                                    setFormData({
                                      ...formData,
                                      [comp.statKey]: "Funcional",
                                    })
                                  }
                                />
                                <span className="text-[10px] font-bold text-black uppercase">
                                  F
                                </span>
                              </label>
                              <div className="w-[1px] h-4 bg-gray-200"></div>
                              <label className="flex items-center space-x-1 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                  checked={
                                    formData[comp.statKey] === "No Funcional"
                                  }
                                  onChange={() =>
                                    setFormData({
                                      ...formData,
                                      [comp.statKey]: "No Funcional",
                                    })
                                  }
                                />
                                <span className="text-[10px] font-bold text-black uppercase">
                                  NF
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* BLOQUE PROCESADOR (Selección histórica VIT/Lenovo) */}
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-9">
                          <label className="block text-xs font-bold text-black mb-1 uppercase">
                            Procesador
                          </label>
                          <select
                            value={formData.processor}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                processor: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md py-1.5 px-3 text-base border outline-none focus:ring-1 focus:ring-blue-400 bg-white cursor-pointer"
                          >
                            <option value="">
                              -- Seleccionar Procesador --
                            </option>
                            <optgroup label="Era DDR2 / DDR3 Inicial (2008-2011)">
                              <option value="Intel Core 2 Duo">
                                Intel Core 2 Duo (VIT 2610 / ThinkCentre)
                              </option>
                              <option value="Intel Pentium Dual-Core">
                                Intel Pentium Dual-Core
                              </option>
                              <option value="Intel Core i3 (1ra Gen)">
                                Intel Core i3 (1ra Gen)
                              </option>
                              <option value="Intel Core i5 (1ra Gen)">
                                Intel Core i5 (1ra Gen)
                              </option>
                            </optgroup>
                            <optgroup label="Era DDR3 / Ivy Bridge (2012-2016)">
                              <option value="Intel Core i3 (2da - 4ta Gen)">
                                Intel Core i3 (2da - 4ta Gen)
                              </option>
                              <option value="Intel Core i5 (2da - 4ta Gen)">
                                Intel Core i5 (2da - 4ta Gen)
                              </option>
                              <option value="Intel Core i7 (4ta Gen)">
                                Intel Core i7 (4ta Gen)
                              </option>
                              <option value="AMD A-Series (A4/A6/A8)">
                                AMD A-Series (Laptops Lenovo)
                              </option>
                            </optgroup>
                            <option value="Otro">Otro / No especificado</option>
                          </select>
                        </div>
                        <div className="md:col-span-3 flex justify-around items-center bg-white border border-gray-200 rounded-md py-1 px-2 h-[38px]">
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-green-600 rounded"
                              checked={formData.processorStatus === "Funcional"}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  processorStatus: "Funcional",
                                })
                              }
                            />
                            <span className="text-[10px] font-bold text-black uppercase">
                              F
                            </span>
                          </label>
                          <div className="w-[1px] h-4 bg-gray-200"></div>
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-red-600 rounded"
                              checked={
                                formData.processorStatus === "No Funcional"
                              }
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  processorStatus: "No Funcional",
                                })
                              }
                            />
                            <span className="text-[10px] font-bold text-black uppercase">
                              NF
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ESTADO GENERAL */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-black mb-3">
                    Estado General del Equipo
                  </label>
                  <div className="flex items-center space-x-8">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        className="h-5 w-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                        checked={formData.status === "Funcional"}
                        onChange={() =>
                          setFormData({ ...formData, status: "Funcional" })
                        }
                      />
                      <span className="ml-2 text-sm font-bold text-gray-700 group-hover:text-black">
                        Funcional
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
                        checked={formData.status === "No Funcional"}
                        onChange={() =>
                          setFormData({ ...formData, status: "No Funcional" })
                        }
                      />
                      <span className="ml-2 text-sm font-bold text-gray-700 group-hover:text-black">
                        No Funcional
                      </span>
                    </label>
                  </div>
                </div>

                {/* NOTAS */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-bold text-black mb-2"
                  >
                    Notas / Observaciones
                  </label>
                  <textarea
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="block w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm border outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Detalles sobre asignación, desgaste físico o fallas detectadas..."
                  ></textarea>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="group inline-flex items-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <FiX className="mr-2 -ml-1 h-4 w-4 group-hover:text-red-600 transition-colors" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <FiSave className="mr-2 -ml-1 h-4 w-4" />
                    Guardar Equipo
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
