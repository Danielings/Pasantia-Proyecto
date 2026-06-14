import express from "express";
import pool from "../config/bd.js";
import { db } from "../config/firebase.js";
//import verificarToken from "../Middleware/autenticación.js";

const Router = express.Router();

Router.get("/ubicaciones", async (req, res) => {
  try {
    const snap = await db.collection("ubicaciones").get();
    const ubicaciones = snap.docs.map((doc) => doc.data());

    // Creamos un Map usando una combinación de campos como clave única
    const unicasMap = new Map();

    ubicaciones.forEach((ubi) => {
      // Definimos qué hace que una ubicación sea "única" (ej: id_sede + id_piso)
      const key = `${ubi.sede}-${ubi.piso}`;
      if (!unicasMap.has(key)) {
        unicasMap.set(key, ubi);
      }
    });

    const resultado = Array.from(unicasMap.values());
    res.status(200).json(resultado);
  } catch (e) {
    res.status(500).json({ message: "Error al obtener ubicaciones" });
  }
});
export default Router;
