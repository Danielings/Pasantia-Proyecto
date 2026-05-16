import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3001/api";

export function useUbicaciones({
  regionActual,
  estadoActual,
  ciudadActual,
  sedeActual,
}) {
  const [regionList, setRegionList] = useState([]);
  const [estadoList, setEstadoList] = useState([]);
  const [ciudadesList, setCiudadesList] = useState([]);
  const [sedeList, setSedeList] = useState([]);
  const [pisoList, setPisoList] = useState([]);
  const [alaList, setAlaList] = useState([]);

  // 1. Obtener regiones al cargar
  useEffect(() => {
    const obtenerRegiones = async () => {
      try {
        const response = await axios.get(`${API_BASE}/region`);
        setRegionList(response.data);
      } catch (error) {
        console.error("Error obteniendo regiones:", error);
      }
    };
    obtenerRegiones();
  }, []);

  // 2. Obtener estados por región
  useEffect(() => {
    const obtenerEstados = async () => {
      if (!regionActual) {
        setEstadoList([]);
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE}/region/${regionActual}/estados`,
        );
        setEstadoList(response.data);
      } catch (error) {
        console.error("Error obteniendo estados:", error);
      }
    };
    obtenerEstados();
  }, [regionActual]);

  // 3. Obtener ciudades por estado
  useEffect(() => {
    const obtenerCiudades = async () => {
      if (!estadoActual) {
        setCiudadesList([]);
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE}/estados/${estadoActual}/ciudades`,
        );
        setCiudadesList(response.data);
      } catch (error) {
        console.error("Error obteniendo ciudades:", error);
      }
    };
    obtenerCiudades();
  }, [estadoActual]);

  // 4. Obtener sedes por ciudad
  useEffect(() => {
    const obtenerSede = async () => {
      if (!ciudadActual) {
        setSedeList([]);
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE}/ciudades/${ciudadActual}/sede`,
        );
        setSedeList(response.data);
      } catch (error) {
        console.error("Error obteniendo sede:", error);
      }
    };
    obtenerSede();
  }, [ciudadActual]);

  // 5. Obtener pisos por sede
  useEffect(() => {
    const obtenerPiso = async () => {
      if (!sedeActual) {
        setPisoList([]);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE}/sede/${sedeActual}/piso`);
        setPisoList(response.data);
      } catch (error) {
        console.error("Error obteniendo pisos:", error);
      }
    };
    obtenerPiso();
  }, [sedeActual]);

  // 6. Obtener alas al cargar
  useEffect(() => {
    const obtenerAlas = async () => {
      try {
        const response = await axios.get(`${API_BASE}/ala`);
        setAlaList(response.data);
      } catch (error) {
        console.error("Error obteniendo alas:", error);
      }
    };
    obtenerAlas();
  }, []);

  // Retornamos todas las listas organizadas y las funciones limpiadoras si se necesitan manualmente
  return {
    regionList,
    estadoList,
    ciudadesList,
    sedeList,
    pisoList,
    alaList,
    setEstadoList,
    setCiudadesList,
  };
}
