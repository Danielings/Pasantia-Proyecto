import express from "express";
import { db } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

const Router = express.Router();
Router.get("/bitacora", async (req, res) => {
  try {
    // Obtenemos los registros ordenados del más reciente al más antiguo
    const snapshot = await db
      .collection("bitacora")
      .orderBy("fecha", "desc")
      .get();

    const bitacora = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        accion: data.accion || "Sin acción",
        detalles: data.detalles || [], // Arreglo de cambios
        // Convertimos el Timestamp de Firestore a formato ISO para el frontend
        fecha: data.fecha ? data.fecha.toDate().toISOString() : null,
        id_modificado: data.id_modificado || "N/A",
        sede: data.sede || "N/A",
        usuario: data.usuario || "Desconocido",
      };
    });

    res.status(200).json(bitacora);
  } catch (e) {
    console.error("Error obteniendo bitácora:", e);
    res.status(500).json({ message: "Error al obtener la bitácora" });
  }
});

export default Router;
