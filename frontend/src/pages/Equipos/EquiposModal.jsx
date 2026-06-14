import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiX,
  FiSave,
  FiTrash2,
  FiMonitor,
  FiHardDrive,
  FiTag,
  FiMapPin,
  FiSettings,
  FiCpu,
} from "react-icons/fi";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LocationSelector from "@/components/ui/LocationSelector";
import { toast } from "react-hot-toast";
import { equipoSchema } from "@/validators/equipoSchema";

export default function EquiposModal({
  isOpen,
  onClose,
  item, // Representa el equipo o periférico seleccionado en la tabla primaria
  type, // "view" | "edit" | "delete"
  categoria, // "equipos" o "perifericos"
  onItemUpdated,
}) {
  // =========================
  // ESTADOS PARA MODO VISTA (FETCHING DINÁMICO)
  // =========================
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // REACT HOOK FORM
  // =========================
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(equipoSchema),
    mode: "onChange",
    defaultValues: {
      tipo: "",
      marca: "",
      modelo: "",
      serial: "",
      estado: "",
      notas: "",
      region: "",
      city: "",
      estado_ubicacion: "",
      sede: "",
      piso: "",
      ala: "",
    },
  });

  const formValues = watch();

  // =========================
  // EFECTO: CARGAR DETALLES PROFUNDOS (VISTA)
  // =========================
  useEffect(() => {
    if (!isOpen || !item || type !== "view") {
      if (!isOpen) setDetalle(null);
      return;
    }

    const fetchDetalleCompleto = async () => {
      try {
        setLoading(true);
        const itemId =
          item.id_equipo || item.id_periferico || item.id || item.itemId;

        // 1. Normalizamos a minúsculas para evitar fallas de tipado
        const tipoLower = (item.tipo || "").toLowerCase().trim();
        const catLower = (categoria || "").toLowerCase().trim();

        // 2. Clasificación inteligente del endpoint objetivo
        let endpointReal = "perifericos";

        if (
          tipoLower === "pc" ||
          tipoLower === "laptop" ||
          catLower === "equipos" ||
          catLower === "pc" ||
          catLower === "laptop"
        ) {
          endpointReal = "equipos";
        }

        // 3. Ejecutamos la petición con la ruta e ID correctos
        const response = await axios.get(
          `http://localhost:3001/api/${endpointReal}/${itemId}`,
        );

        setDetalle(response.data);
      } catch (error) {
        console.error("Error al recuperar información del servidor:", error);
        toast.error("No se pudo sincronizar el detalle del activo.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetalleCompleto();
  }, [isOpen, item, type, categoria]);

  // =========================
  // EFECTO: CARGAR DATOS EN MODO EDICIÓN
  // =========================
  useEffect(() => {
    if (item && type === "edit") {
      // Priorizamos la asignación más reciente si viene de periféricos, de lo contrario ubicacion
      const loc = item.asignacion || item.ubicacion || item;
      reset({
        tipo: item.tipo || "",
        marca: item.marca || "",
        modelo: item.modelo || "",
        serial: item.serial || "",
        estado: item.estado || "",
        notas: item.notas || "",
        region: item.id_region || loc.region || "",
        estado_ubicacion:
          item.id_estado || loc.estado || item.estado_ubicacion || "",
        city: item.id_ciudad || loc.ciudad || item.ciudad || "",
        sede: item.id_sede || loc.sede || "",
        piso: item.id_piso || loc.piso || "",
        ala: item.id_ala || loc.alas || loc.ala || "",
      });
    }
  }, [item, type, reset]);

  // =========================
  // CONTROLADORES DE UBICACIÓN
  // =========================
  const handleSetFormData = (updater) => {
    const nextValues =
      typeof updater === "function" ? updater(formValues) : updater;

    Object.entries(nextValues).forEach(([key, value]) => {
      const currentValue = getValues(key);
      const cambioElValor = currentValue !== value;

      setValue(key, value, {
        shouldValidate: cambioElValor,
        shouldDirty: true,
      });
    });
  };

  const handleDefaultLocation = () => {};
  const handleKeyDown = (e) => {};

  // =========================
  // ACCIÓN: MANDAR ACTUALIZACIÓN (PUT)
  // =========================
  const onSubmitEdit = async (data) => {
    const payload = {
      tipo: data.tipo?.trim(),
      marca: data.marca?.trim(),
      modelo: data.modelo?.trim(),
      serial: data.serial?.trim(),
      estado: data.estado?.trim(),
      notas: data.notas?.trim() || null,
      region: String(data.region || ""),
      estado_ubicacion: String(data.estado_ubicacion || ""),
      ciudad: String(data.city || ""),
      sede: String(data.sede || ""),
      piso: String(data.piso || ""),
      alas: String(data.ala || ""),
    };

    const itemId =
      item.id_equipo || item.id_periferico || item.id || item.itemId;

    const peticionEdicion = axios.put(
      `http://localhost:3001/api/${categoria}/${itemId}`,
      payload,
    );

    toast.promise(peticionEdicion, {
      loading: "Guardando cambios...",
      success: (response) => {
        if (onItemUpdated) onItemUpdated();
        onClose();
        return response.data.message || "Registro editado con éxito";
      },
      error: (error) =>
        error.response?.data?.message || "Error al editar el registro",
    });
  };

  // =========================
  // ACCIÓN: ELIMINACIÓN LÓGICA (PUT)
  // =========================
  const handleDelete = async () => {
    const itemId =
      item.id_equipo || item.id_periferico || item.id || item.itemId;
    const peticionEliminacion = axios.put(
      `http://localhost:3001/api/${categoria}/eliminado/${itemId}`,
    );

    toast.promise(peticionEliminacion, {
      loading: "Eliminando registro...",
      success: (response) => {
        if (onItemUpdated) onItemUpdated();
        onClose();
        return response.data.message || "Registro desincorporado correctamente";
      },
      error: (error) =>
        error.response?.data?.message || "Error al desincorporar el registro",
    });
  };

  // =========================
  // PROCESAMIENTO SEGURO DE UBICACIÓN EN VISTA
  // =========================
  const targetData = type === "view" ? detalle || item : item;

  // Extraemos dinámicamente priorizando la asignación
  const locActual =
    targetData?.asignacion || targetData?.ubicacion || targetData;
  const ubicacionTexto = locActual
    ? `${locActual.sede || ""} - ${locActual.ciudad || locActual.city || ""} - Piso ${locActual.piso || ""}${
        locActual.ala || locActual.alas
          ? ` - Ala ${locActual.ala || locActual.alas}`
          : ""
      }`
    : "";

  // Helper para verificar si es periférico de forma estricta
  const esPeriferico =
    categoria === "perifericos" ||
    (detalle?.tipo && !["pc", "laptop"].includes(detalle.tipo.toLowerCase()));

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
        {/* HEADER */}
        <div className="bg-primary-900 px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {type === "view" && "Detalles de Inventario"}
              {type === "edit" && "Editar Activo Tecnológico"}
              {type === "delete" && "Desincorporar Activo"}
            </h2>
            <p className="text-primary-100 text-sm mt-1">
              {type === "view" &&
                "Información de especificaciones, componentes y dependencias jerárquicas."}
              {type === "edit" &&
                "Actualiza los datos técnicos e infraestructura física del activo."}
              {type === "delete" &&
                "Esta acción marcará el estado del activo como desincorporado o inactivo."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-xl p-2 transition-all"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* MODO VISTA (VIEW) */}
        {type === "view" && (
          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium text-sm animate-pulse">
                  Sincronizando con base de datos...
                </p>
              </div>
            ) : detalle ? (
              <div className="space-y-6">
                {/* GRID DE DATOS MAESTROS GENERALES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <FiMonitor className="text-primary-600 w-5 h-5" />
                      <h3 className="font-bold text-gray-800">
                        Identificación del Activo
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p>
                        <span className="font-semibold text-gray-500">
                          Tipo:
                        </span>{" "}
                        <span className="font-bold text-gray-800">
                          {detalle.tipo}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-gray-500">
                          Marca:
                        </span>{" "}
                        <span className="text-gray-700">{detalle.marca}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-gray-500">
                          Modelo:
                        </span>{" "}
                        <span className="text-gray-700">{detalle.modelo}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <FiTag className="text-primary-600 w-5 h-5" />
                      <h3 className="font-bold text-gray-800">
                        Control de Inventario
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p>
                        <span className="font-semibold text-gray-500">
                          Serial S/N:
                        </span>{" "}
                        <span className="font-mono bg-white px-2 py-0.5 rounded border font-semibold text-gray-800">
                          {detalle.serial}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-gray-500">
                          Estado Físico:
                        </span>{" "}
                        <span
                          className={`font-bold ${
                            detalle.estado === "Bueno" ||
                            detalle.estado === "Operativo"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {detalle.estado}
                        </span>
                      </p>
                      {/* SOLUCIÓN AL PUNTO 2: Mostrar vinculación directamente arriba en el control principal */}
                      {esPeriferico && (
                        <p>
                          <span className="font-semibold text-gray-500">
                            Acoplamiento:
                          </span>{" "}
                          {detalle.equipoRelacionado ? (
                            <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                              Vinculado a {detalle.equipoRelacionado.tipo}
                            </span>
                          ) : (
                            <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 text-xs">
                              Disponible / En Stock
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <FiSettings className="text-primary-600 w-5 h-5" />
                      <h3 className="font-bold text-gray-800">
                        Notas u Observaciones
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      {detalle.notas ||
                        "Sin observaciones o incidencias registradas en el sistema."}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <FiMapPin className="text-primary-600 w-5 h-5" />
                      <h3 className="font-bold text-gray-800">
                        {esPeriferico
                          ? "Ubicación de Asignación (Actual)"
                          : "Ubicación Geográfica / Técnica"}
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {ubicacionTexto ||
                        "Sin asignación geográfica registrada."}
                    </p>
                  </div>
                </div>

                {/* --- RENDERIZADO SUB-DATOS DE EQUIPOS (PC / LAPTOP) --- */}
                {!esPeriferico && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-5">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <FiCpu className="text-primary-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-800">
                          Componentes de Hardware Interno
                        </h3>
                      </div>
                      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                        {detalle.componentes &&
                        detalle.componentes.length > 0 ? (
                          detalle.componentes.map((comp, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center text-sm"
                            >
                              <div>
                                <p className="font-bold text-gray-800">
                                  {comp.tipo?.replace("_", " ")}
                                </p>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">
                                  S/N: {comp.serial}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  {comp.marca} · Mod: {comp.modelo}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                {comp.capacidad && (
                                  <span className="bg-primary-50 text-primary-700 font-extrabold px-2 py-0.5 rounded-lg text-xs border border-primary-100">
                                    {comp.capacidad}
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                    comp.estado === "Bueno"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {comp.estado}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            No posee componentes de hardware interno asignados
                            en el esquema.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <FiMonitor className="text-primary-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-800">
                          Periféricos de Estación de Trabajo
                        </h3>
                      </div>
                      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                        {detalle.perifericos &&
                        detalle.perifericos.length > 0 ? (
                          detalle.perifericos.map((peri, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center text-sm"
                            >
                              <div>
                                <p className="font-bold text-gray-800">
                                  {peri.tipo}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {peri.marca} {peri.modelo}
                                </p>
                                <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                                  S/N: {peri.serial}
                                </p>
                              </div>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  peri.estado === "Bueno" ||
                                  peri.estado === "Operativo"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {peri.estado}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            Esta estación de trabajo no reporta periféricos
                            enlazados.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- RENDERIZADO SUB-DATOS DE PERIFÉRICOS INDIVIDUALES --- */}
                {esPeriferico && (
                  <div className="border-t pt-5">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <FiSettings className="text-primary-600 w-5 h-5" />
                        <h3 className="font-bold text-gray-800">
                          Relación de Acoplamiento e Infraestructura
                        </h3>
                      </div>

                      {detalle.equipoRelacionado ? (
                        <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-sm">
                          <div>
                            <span className="text-xs text-gray-400 font-bold uppercase block">
                              Dispositivo Contenedor
                            </span>
                            <span className="font-bold text-gray-800 mt-0.5 block">
                              {detalle.equipoRelacionado.tipo}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 font-bold uppercase block">
                              Marca / Modelo
                            </span>
                            <span className="text-gray-700 mt-0.5 block">
                              {detalle.equipoRelacionado.marca}{" "}
                              {detalle.equipoRelacionado.modelo}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 font-bold uppercase block">
                              Serial del Equipo
                            </span>
                            <span className="font-mono bg-gray-50 px-2 py-0.5 border rounded text-xs text-primary-700 font-bold mt-0.5 inline-block">
                              {detalle.equipoRelacionado.serial}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="bg-green-100 text-green-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-green-200 uppercase">
                              Asignado / Activo
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-200 flex justify-between items-center text-sm">
                          <p className="text-yellow-800 font-medium">
                            Este periférico se encuentra libre en stock (no está
                            enlazado a ninguna estación o PC de la Torre).
                          </p>
                          <span className="bg-yellow-100 text-yellow-800 font-bold text-xs px-2.5 py-1 rounded-full uppercase">
                            No Asignado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center py-10 text-gray-400 text-sm">
                Error crítico al estructurar los mapeos de datos.
              </p>
            )}
          </div>
        )}

        {/* MODO EDICIÓN (EDIT) */}
        {type === "edit" && (
          <form
            onSubmit={handleSubmit(onSubmitEdit, (erroresValidacion) =>
              console.log("Errores de Zod:", erroresValidacion),
            )}
            className="p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Tipo de Activo
                </label>
                <input
                  {...register("tipo")}
                  placeholder="Ej: PC, Laptop, Monitor, Teclado..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.tipo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tipo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Marca</label>
                <input
                  {...register("marca")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.marca && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.marca.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Modelo</label>
                <input
                  {...register("modelo")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.modelo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.modelo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Serial</label>
                <input
                  {...register("serial")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.serial && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.serial.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Estado Físico
                </label>
                <select
                  {...register("estado")}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Seleccione un estado...</option>
                  <option value="Operativo">Operativo</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Dañado">Dañado</option>
                  <option value="En Reparación">En Reparación</option>
                  <option value="Desincorporado">Desincorporado</option>
                </select>
                {errors.estado && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.estado.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Notas / Observaciones
                </label>
                <input
                  {...register("notas")}
                  placeholder="Detalles adicionales..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.notas && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.notas.message}
                  </p>
                )}
              </div>

              {/* SECTOR UBICACIÓN */}
              <div className="col-span-1 lg:col-span-3 pb-7 mt-4 [&>div>h3]:hidden [&>div]:p-0 [&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&_label]:text-sm [&_label]:font-bold [&_label]:text-black [&_label]:mb-2 [&_label]:block [&_input]:w-full [&_input]:rounded-lg [&_input]:border-gray-300 [&_input]:shadow-sm [&_input]:py-2 [&_input]:px-3 [&_input]:text-sm [&_button]:hidden [&_.absolute]:z-50 [&_ul]:max-h-60 [&_ul]:overflow-y-auto">
                <h3 className="block text-lg font-bold mb-4 border-b pb-2">
                  Ubicación de Asignación
                </h3>
                <LocationSelector
                  title=""
                  radioGroupName="equipo_ubicacion_default"
                  formData={formValues}
                  setFormData={handleSetFormData}
                  onKeyDown={handleKeyDown}
                  handleDefaultLocation={handleDefaultLocation}
                  typePrefix=""
                />
                {(errors.region ||
                  errors.estado_ubicacion ||
                  errors.city ||
                  errors.sede ||
                  errors.piso) && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    * Ubicación requerida completa.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
              >
                <FiSave />
                Guardar Cambios
              </button>
            </div>
          </form>
        )}

        {/* MODO ELIMINAR (DELETE) */}
        {type === "delete" && (
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-5 rounded-full mb-5">
                <FiTrash2 className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                ¿Desincorporar Activo?
              </h3>
              <p className="text-gray-600 max-w-md">
                El elemento con serial{" "}
                <strong className="font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                  {item.serial}
                </strong>{" "}
                cambiará su estado operativo e histórico en la base de datos de
                CANTV.
              </p>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
                >
                  <FiTrash2 />
                  Confirmar Desincorporación
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
