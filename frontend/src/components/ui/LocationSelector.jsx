import React, { useState, useEffect } from "react";
import axios from "axios";

export default function LocationSelector({
  title,
  formData,
  setFormData,
  handleDefaultLocation,
  typePrefix,
  radioGroupName,
}) {
  const [regionesList, setRegionesList] = useState([]);
  const [estadosList, setEstadosList] = useState([]);
  const [ciudadesList, setCiudadesList] = useState([]);
  const [sedeList, setSedeList] = useState([]);
  const [pisoList, setPisoList] = useState([]);
  const [alaList, setAlaList] = useState([]);

  const getFieldValue = (field) => formData[`${field}${typePrefix}`];

  //constantes q obtendrán los valores de regiones y estado
  const regionActual = getFieldValue("region");
  const estadoActual = getFieldValue("estado");
  const ciudadActual = getFieldValue("city");
  const sedeActual = getFieldValue("sede");

  //se obtiene las regiones
  useEffect(() => {
    const obtenerRegiones = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/region");
        setRegionesList(response.data);
      } catch (error) {
        console.error("Error obteniendo regiones:", error);
      }
    };
    obtenerRegiones();
  }, []);

  //obtiene los estados
  useEffect(() => {
    const obtenerEstados = async () => {
      if (!regionActual) {
        setEstadosList([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/api/region/${regionActual}/estados`,
        );
        setEstadosList(response.data);
      } catch (error) {
        console.error("Error obteniendo estados:", error);
      }
    };
    obtenerEstados();
  }, [regionActual]);

  //obtiene ciudades
  useEffect(() => {
    const obtenerCiudades = async () => {
      if (!estadoActual) {
        setCiudadesList([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/api/estados/${estadoActual}/ciudades`,
        );
        setCiudadesList(response.data);
      } catch (error) {
        console.error("Error obteniendo ciudades:", error);
      }
    };
    obtenerCiudades();
  }, [estadoActual]);

  //otbtiene sedes
  useEffect(() => {
    const obtenerSede = async () => {
      if (!ciudadActual) {
        setSedeList([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/api/ciudades/${ciudadActual}/sede`,
        );
        setSedeList(response.data);
      } catch (error) {
        console.error("Error obteniendo sede:", error);
      }
    };
    obtenerSede();
  }, [ciudadActual]);

  //obtiene piso 21
  useEffect(() => {
    const obtenerPiso = async () => {
      if (!sedeActual) {
        setPisoList([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/api/sede/${sedeActual}/piso`,
        );
        setPisoList(response.data);
      } catch (error) {
        console.error("Error obteniendo sede:", error);
      }
    };
    obtenerPiso();
  }, [sedeActual]);

  //obtiene alas
  useEffect(() => {
    const obtenerAlas = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/ala");
        setAlaList(response.data);
      } catch (error) {
        console.error("Error obteniendo alas:", error);
      }
    };
    obtenerAlas();
  }, []);

  // Función auxiliar para actualizar campos específicos dinámicamente
  const handleFieldChange = (field, value) => {
    const fieldName = `${field}${typePrefix}`;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
      {/* Cabecera con botones por defecto */}
      <div className="col-span-full flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-blue-800 uppercase">{title}</h3>
        <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
          <label className="flex items-center space-x-2 cursor-pointer bg-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-colors">
            <input
              type="radio"
              name={radioGroupName}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              onChange={(e) =>
                e.target.checked &&
                handleDefaultLocation(typePrefix || "A", "torre30")
              }
            />
            <span className="text-[10px] md:text-xs font-semibold text-gray-700 whitespace-nowrap">
              Torre 30 Default
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer bg-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-blue-200 shadow-sm hover:bg-blue-50 transition-colors">
            <input
              type="radio"
              name={radioGroupName}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              onChange={(e) =>
                e.target.checked &&
                handleDefaultLocation(typePrefix || "A", "torreEste")
              }
            />
            <span className="text-[10px] md:text-xs font-semibold text-gray-700 whitespace-nowrap">
              Torre Este Default
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer bg-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-red-100 shadow-sm hover:bg-red-50 transition-colors">
            <input
              type="radio"
              name={radioGroupName}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              onChange={(e) =>
                e.target.checked &&
                handleDefaultLocation(typePrefix || "A", "limpiar")
              }
            />
            <span className="text-[10px] md:text-xs font-semibold text-gray-700 whitespace-nowrap">
              Limpiar
            </span>
          </label>
        </div>
      </div>

      {/* Selects de Ubicación */}
      <div>
        <label className="block text-sm font-bold text-black mb-2">
          Region <span className="text-red-500">*</span>
        </label>
        <select
          required
          className="w-full border-gray-300 rounded-lg py-2 px-3 border outline-none bg-white focus:ring-2 focus:ring-primary-500"
          value={getFieldValue("region") || ""}
          onChange={(e) => {
            handleFieldChange("region", e.target.value);
            handleFieldChange("estado", ""); // Limpiamos el estado si cambian la región
          }}
        >
          <option value="" disabled>
            Seleccione Región
          </option>
          {regionesList.map((r) => (
            <option key={r.id_region} value={r.id_region}>
              {r.region}
            </option>
          ))}
        </select>
      </div>

      <div title={!regionActual ? "Debe seleccionar una región" : ""}>
        <label className="block text-sm font-bold text-black mb-2">
          Estado <span className="text-red-500">*</span>
        </label>
        <select
          required
          className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={getFieldValue("estado") || ""}
          onChange={(e) => {
            handleFieldChange("estado", e.target.value);
            handleFieldChange("city", "");
          }}
          disabled={!regionActual || estadosList.length === 0}
        >
          <option value="" disabled>
            Seleccione Estado
          </option>
          {estadosList.map((est) => (
            <option key={est.id_estado} value={est.id_estado}>
              {est.estados}
            </option>
          ))}
        </select>
      </div>

      <div title={!estadoActual ? "Debe seleccionar una estado" : ""}>
        <label className="block text-sm font-bold text-black mb-2">
          Ciudad <span className="text-red-500">*</span>
        </label>
        <select
          required
          className="w-full border-gray-300 rounded-lg py-2 px-3 border outline-none bg-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={getFieldValue("city") || ""}
          onChange={(e) => handleFieldChange("city", e.target.value)}
          disabled={!estadoActual || ciudadesList.length === 0} // Se bloquea si no hay estado
        >
          <option value="" disabled>
            Seleccione Ciudad
          </option>
          {/* Mapeo dinámico de los estados desde la BD */}
          {ciudadesList.map((cd) => (
            <option key={cd.id_ciudad} value={cd.id_ciudad}>
              {cd.ciudad}
            </option>
          ))}
        </select>
      </div>

      <div title={!ciudadActual ? "Debe seleccionar una ciudad" : ""}>
        <label className="block text-sm font-bold text-black mb-2">
          Sede / Torre <span className="text-red-500">*</span>
        </label>
        <select
          required
          className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={getFieldValue("sede") || ""}
          onChange={(e) => handleFieldChange("sede", e.target.value)}
          disabled={!ciudadActual || sedeList.length === 0}
        >
          <option value="" disabled>
            Seleccione Torre
          </option>
          {sedeList.map((cd) => (
            <option key={cd.id_sede} value={cd.id_sede}>
              {cd.sede}
            </option>
          ))}
        </select>
      </div>

      <div title={!sedeActual ? "Debe seleccionar una sede" : ""}>
        <label className="block text-sm font-bold text-black mb-2">
          Piso <span className="text-red-500">*</span>
        </label>
        <select
          required
          className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={getFieldValue("piso") || ""}
          onChange={(e) => handleFieldChange("piso", e.target.value)}
          disabled={!sedeActual || pisoList.length === 0}
        >
          <option value="" disabled>
            Seleccione Piso
          </option>
          {pisoList.map((cd) => (
            <option key={cd.id_piso} value={cd.id_piso}>
              {cd.piso}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2">
          Ala <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={getFieldValue("ala") || ""}
          onChange={(e) => handleFieldChange("ala", e.target.value)}
          disabled={alaList.length === 0}
        >
          {alaList.map((cd) => (
            <option key={cd.id_ala} value={cd.id_ala}>
              {cd.ala}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
