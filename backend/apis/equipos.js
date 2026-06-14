import express from "express";
import crypto from "crypto";
import { db } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import verificarToken from "../middleware/verificarToken.js";

const Router = express.Router();

const COL = {
  equipos: "equipos",
  ubicaciones: "ubicaciones",
  indices: "indices",
};

const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const sha1 = (value) =>
  crypto.createHash("sha1").update(String(value)).digest("hex");

const locationRequiredFields = ["region", "estado", "ciudad", "sede", "piso"];

/* =========================
   MAPEO DE TIPOS CON CAPITALIZACIÓN ESTRICTA
========================= */
const EQUIPOS_MAP = {
  pc: "PC",
  laptop: "Laptop",
};

const COMPONENTES_MAP = {
  procesador: "Procesador",
  memoria_ram: "Memoria_RAM",
  disco_duro: "Disco_Duro",
  motherboard: "Motherboard",
};

const PERIFERICOS_MAP = {
  monitor: "Monitor",
  teclado: "Teclado",
  teclados: "Teclado",
  mouse: "Mouse",
  switch: "Switch",
  impresora: "Impresora",
  corneta: "Corneta",
  cornetas: "Corneta",
};

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function requireString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`El campo "${fieldName}" es obligatorio.`);
  }
  return value.trim();
}

function normalizeLocationInput(input, label) {
  if (!input || typeof input !== "object") {
    throw badRequest(`La ubicación de ${label} es obligatoria.`);
  }

  const data = {};
  for (const field of locationRequiredFields) {
    data[field] = requireString(input[field], `${label}.${field}`);
  }

  data.ala = input.ala ? String(input.ala).trim() : null;
  return data;
}

function locationIdFromData(data) {
  const raw = [
    normalize(data.region),
    normalize(data.estado),
    normalize(data.ciudad),
    normalize(data.sede),
    normalize(data.piso),
    normalize(data.ala || ""),
  ].join("|");

  return `ubi_${sha1(raw)}`;
}

function serialIndexId(prefix, serial) {
  return `${prefix}_${sha1(normalize(serial))}`;
}

async function validateUniqueSerial(tx, serial, tipo) {
  const indexId = serialIndexId(tipo, serial);
  const ref = db.collection(COL.indices).doc(indexId);
  const snap = await tx.get(ref);

  if (snap.exists) {
    throw badRequest(`El serial "${serial}" ya se encuentra registrado.`);
  }
}

function validatePayloadDuplicates(componentes, perifericos) {
  const serials = new Set();

  for (const item of [...componentes, ...perifericos]) {
    const serialNorm = normalize(item.serial);

    if (serials.has(serialNorm)) {
      throw badRequest(
        `El serial "${item.serial}" está repetido dentro del formulario.`,
      );
    }
    serials.add(serialNorm);
  }
}

async function getOrCreateUbicacion(tx, input, label) {
  const data = normalizeLocationInput(input, label);
  const id = locationIdFromData(data);
  const ref = db.collection(COL.ubicaciones).doc(id);
  const snap = await tx.get(ref);

  if (!snap.exists) {
    tx.set(ref, {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  return { id, ...data };
}

async function reserveIndex(
  tx,
  { prefix, serial, equipoId, equipoSerial, tipoEquipo, itemType },
) {
  const id = serialIndexId(prefix, serial);
  const ref = db.collection(COL.indices).doc(id);
  const snap = await tx.get(ref);

  if (snap.exists) {
    const current = snap.data();
    if (current.equipoId && current.equipoId !== equipoId) {
      throw badRequest(
        `El serial "${serial}" ya está registrado en otro equipo.`,
      );
    }
    tx.set(
      ref,
      {
        prefix,
        serial,
        serialNorm: normalize(serial),
        equipoId,
        equipoSerial,
        tipoEquipo,
        itemType,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return id;
  }

  tx.set(ref, {
    prefix,
    serial,
    serialNorm: normalize(serial),
    equipoId,
    equipoSerial,
    tipoEquipo,
    itemType,
    createdAt: FieldValue.serverTimestamp(),
  });

  return id;
}

async function releaseIndex(tx, { prefix, serial }) {
  const id = serialIndexId(prefix, serial);
  const ref = db.collection(COL.indices).doc(id);
  const snap = await tx.get(ref);

  if (snap.exists) {
    tx.delete(ref);
  }
}

function validateEquipoBody(body) {
  const {
    marca,
    modelo,
    serial,
    estado,
    notas = null,
    procedencia,
    asignacion,
    componentes = [],
    perifericos = [],
  } = body;

  if (typeof marca !== "string" || !marca.trim()) {
    throw badRequest('El campo "marca" es obligatorio.');
  }

  if (typeof modelo !== "string" || !modelo.trim()) {
    throw badRequest('El campo "modelo" es obligatorio.');
  }

  requireString(serial, "serial");
  requireString(estado, "estado");

  if (!Array.isArray(componentes)) {
    throw badRequest('El campo "componentes" debe ser un arreglo.');
  }

  if (!Array.isArray(perifericos)) {
    throw badRequest('El campo "perifericos" debe ser un arreglo.');
  }

  normalizeLocationInput(procedencia, "procedencia");
  normalizeLocationInput(asignacion, "asignacion");

  return {
    marca: marca.trim(),
    modelo: modelo.trim(),
    serial: serial.trim(),
    estado: estado.trim(),
    notas: notas ? String(notas).trim() : null,
    procedencia,
    asignacion,
    componentes,
    perifericos,
  };
}

function normalizeComponent(component, index) {
  if (!component || typeof component !== "object") {
    throw badRequest(`El componente #${index + 1} no es válido.`);
  }

  const tipoNorm = normalize(component.tipo);
  const tipoCorrecto = COMPONENTES_MAP[tipoNorm];

  if (!tipoCorrecto) {
    throw badRequest(
      `El componente #${index + 1} tiene un tipo inválido: ${component.tipo}`,
    );
  }

  const serial = requireString(
    component.serial,
    `componentes[${index}].serial`,
  );
  const estado = requireString(
    component.estado,
    `componentes[${index}].estado`,
  );

  const data = {
    tipo: tipoCorrecto,
    marca: component.marca ? String(component.marca).trim() : "Genérico",
    modelo: component.modelo ? String(component.modelo).trim() : "Genérico",
    serial,
    estado,
    notas: component.notas ? String(component.notas).trim() : null,
  };

  if (tipoCorrecto === "Memoria_RAM" || tipoCorrecto === "Disco_Duro") {
    if (!component.capacidad || !String(component.capacidad).trim()) {
      throw badRequest(
        `El componente "${tipoCorrecto}" requiere el campo "capacidad".`,
      );
    }
    data.capacidad = String(component.capacidad).trim();
  }

  return data;
}

function normalizePeriferico(periferico, index) {
  if (!periferico || typeof periferico !== "object") {
    throw badRequest(`El periférico #${index + 1} no es válido.`);
  }

  const tipoNorm = normalize(periferico.tipo);
  const tipoCorrecto = PERIFERICOS_MAP[tipoNorm];

  if (!tipoCorrecto) {
    throw badRequest(
      `El periférico #${index + 1} tiene un tipo inválido: ${periferico.tipo}`,
    );
  }

  const serial = requireString(
    periferico.serial,
    `perifericos[${index}].serial`,
  );
  const estado = requireString(
    periferico.estado,
    `perifericos[${index}].estado`,
  );

  return {
    tipo: tipoCorrecto,
    marca: periferico.marca ? String(periferico.marca).trim() : "Genérico",
    modelo: periferico.modelo ? String(periferico.modelo).trim() : "Genérico",
    serial,
    estado,
    notas: periferico.notas ? String(periferico.notas).trim() : null,
  };
}

function buildEquipoDoc(
  tipoEquipo,
  body,
  procedencia,
  asignacion,
  componentes,
  perifericos,
) {
  return {
    tipo: tipoEquipo,
    marca: body.marca.trim(),
    modelo: body.modelo.trim(),
    serial: body.serial.trim(),
    serialNorm: normalize(body.serial),
    estado: body.estado.trim(),
    notas: body.notas || null,
    fechaRegistro: new Date().toISOString(),
    procedencia,
    asignacion,
    componentes,
    perifericos,
    componentesSerials: componentes.map((c) => normalize(c.serial)),
    perifericosSerials: perifericos.map((p) => normalize(p.serial)),
    estadoActivo: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

// ... (resto de tus importaciones y funciones de validación) ...

async function registrarEquipo(tipoRaw, req, res) {
  try {
    const tipoNorm = normalize(tipoRaw);
    const tipoEquipo = EQUIPOS_MAP[tipoNorm];

    if (!tipoEquipo) {
      return res.status(400).json({ message: "Tipo de equipo inválido." });
    }

    const body = validateEquipoBody(req.body);
    validatePayloadDuplicates(body.componentes, body.perifericos);

    const equipoRef = db.collection(COL.equipos).doc();

    const resultId = await db.runTransaction(async (tx) => {
      // --- FASE 1: LECTURAS (tx.get) ---
      await validateUniqueSerial(tx, body.serial, "equipo");

      const procData = normalizeLocationInput(body.procedencia, "procedencia");
      const asigData = normalizeLocationInput(body.asignacion, "asignacion");
      const procRef = db
        .collection(COL.ubicaciones)
        .doc(locationIdFromData(procData));
      const asigRef = db
        .collection(COL.ubicaciones)
        .doc(locationIdFromData(asigData));

      const snapProc = await tx.get(procRef);
      const snapAsig = await tx.get(asigRef);

      const normalizedComponentes = [];
      for (let i = 0; i < body.componentes.length; i++) {
        const comp = normalizeComponent(body.componentes[i], i);
        await validateUniqueSerial(tx, comp.serial, "componente");
        normalizedComponentes.push(comp);
      }

      const normalizedPerifericos = [];
      // Arreglo para guardar las referencias de los periféricos leídos en la base de datos
      const perifericosExistentes = [];

      for (let i = 0; i < body.perifericos.length; i++) {
        const peri = normalizePeriferico(body.perifericos[i], i);
        const periSerialNorm = normalize(peri.serial);

        // Verificamos si el periférico ya existe en la colección independiente
        const periQuery = await tx.get(
          db
            .collection("perifericos")
            .where("serialNorm", "==", periSerialNorm)
            .limit(1),
        );

        if (!periQuery.empty) {
          const periDoc = periQuery.docs[0];
          if (periDoc.data().asignado) {
            throw badRequest(
              `El periférico con serial "${peri.serial}" ya está asignado a otro equipo.`,
            );
          }
          perifericosExistentes.push({
            ref: periDoc.ref,
            data: periDoc.data(),
          });
        } else {
          perifericosExistentes.push(null); // Null indica que hay que crearlo
        }

        await validateUniqueSerial(tx, peri.serial, "periferico");
        normalizedPerifericos.push(peri);
      }

      // --- FASE 2: ESCRITURAS (tx.set / tx.update) ---
      if (!snapProc.exists) {
        tx.set(
          procRef,
          { ...procData, createdAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
      }
      if (!snapAsig.exists) {
        tx.set(
          asigRef,
          { ...asigData, createdAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
      }

      // Guardar componentes en índices
      for (const comp of normalizedComponentes) {
        const idxId = serialIndexId("componente", comp.serial);
        tx.set(db.collection(COL.indices).doc(idxId), {
          prefix: "componente",
          serial: comp.serial,
          serialNorm: normalize(comp.serial),
          equipoId: equipoRef.id,
          equipoSerial: body.serial,
          tipoEquipo,
          itemType: comp.tipo,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // Guardar periféricos en índices Y en la colección "perifericos"
      for (let i = 0; i < normalizedPerifericos.length; i++) {
        const peri = normalizedPerifericos[i];
        const existente = perifericosExistentes[i];

        const idxId = serialIndexId("periferico", peri.serial);

        // 1. Guardar en índices
        tx.set(db.collection(COL.indices).doc(idxId), {
          prefix: "periferico",
          serial: peri.serial,
          serialNorm: normalize(peri.serial),
          equipoId: equipoRef.id,
          equipoSerial: body.serial,
          tipoEquipo,
          itemType: peri.tipo,
          createdAt: FieldValue.serverTimestamp(),
        });

        // 2. Sincronizar con la colección "perifericos"
        if (existente) {
          // Si el periférico ya estaba registrado suelto, lo actualizamos
          tx.update(existente.ref, {
            asignado: true,
            equipoId: equipoRef.id,
            equipoSerial: body.serial,
            fechaActualizacion: FieldValue.serverTimestamp(),
          });
        } else {
          // Si no existía, lo creamos e heredamos la ubicación del equipo
          const newPeriRef = db.collection("perifericos").doc();
          tx.set(newPeriRef, {
            tipo: peri.tipo,
            marca: peri.marca,
            modelo: peri.modelo,
            serial: peri.serial,
            serialNorm: normalize(peri.serial),
            estado: peri.estado,
            notas: peri.notas,
            procedencia: procData,
            asignacion: asigData,
            asignado: true,
            equipoId: equipoRef.id,
            equipoSerial: body.serial,
            activo: true,
            fechaCreacion: FieldValue.serverTimestamp(),
            fechaActualizacion: FieldValue.serverTimestamp(),
          });
        }
      }

      const teamIndexId = serialIndexId("equipo", body.serial);
      tx.set(db.collection(COL.indices).doc(teamIndexId), {
        prefix: "equipo",
        serial: body.serial,
        serialNorm: normalize(body.serial),
        equipoId: equipoRef.id,
        equipoSerial: body.serial,
        tipoEquipo,
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(
        equipoRef,
        buildEquipoDoc(
          tipoEquipo,
          body,
          procData,
          asigData,
          normalizedComponentes,
          normalizedPerifericos,
        ),
      );

      return equipoRef.id;
    });

    return res.status(201).json({
      message: `${tipoEquipo.toUpperCase()} registrada con éxito.`,
      id: resultId,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Error interno" });
  }
}

Router.post("/pc", async (req, res) => registrarEquipo("pc", req, res));
Router.post("/laptop", async (req, res) => registrarEquipo("laptop", req, res));

Router.get("/equipos", verificarToken, async (req, res) => {
  try {
    const { tipo, estado, serial } = req.query;
    const snap = await db.collection(COL.equipos).get();

    let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (rol !== "Superadministrador") {
      rows = rows.filter(
        (r) => r.torre === torre || r.asignacion?.sede === torre,
      );
    }

    if (tipo) {
      const tipoNorm = normalize(tipo);
      rows = rows.filter((r) => normalize(r.tipo) === tipoNorm);
    }

    if (estado) {
      const estadoNorm = normalize(estado);
      rows = rows.filter((r) => normalize(r.estado) === estadoNorm);
    }

    if (serial) {
      const serialNorm = normalize(serial);
      rows = rows.filter((r) => normalize(r.serial) === serialNorm);
    }

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron obtener los equipos.",
      error: error.message,
    });
  }
});

Router.get("/equipos/:id", async (req, res) => {
  try {
    const snap = await db.collection(COL.equipos).doc(req.params.id).get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }

    return res.status(200).json({ id: snap.id, ...snap.data() });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener el equipo.",
      error: error.message,
    });
  }
});

//falta mejorar
Router.put("/equipos/:id", async (req, res) => {
  try {
    const equipoId = req.params.id;
    const body = validateEquipoBody(req.body);

    const result = await db.runTransaction(async (tx) => {
      const equipoRef = db.collection(COL.equipos).doc(equipoId);
      const equipoSnap = await tx.get(equipoRef);

      if (!equipoSnap.exists) {
        throw badRequest("Equipo no encontrado.");
      }

      const current = equipoSnap.data();
      const tipoEquipo = EQUIPOS_MAP[normalize(current.tipo)] || current.tipo;

      const currentTeamIndexRef = db
        .collection(COL.indices)
        .doc(serialIndexId("equipo", current.serial));

      const newSerialNorm = normalize(body.serial);
      const oldSerialNorm = normalize(current.serial);

      if (newSerialNorm !== oldSerialNorm) {
        const newTeamIndexRef = db
          .collection(COL.indices)
          .doc(serialIndexId("equipo", body.serial));
        const newTeamIndexSnap = await tx.get(newTeamIndexRef);

        if (newTeamIndexSnap.exists) {
          const idx = newTeamIndexSnap.data();
          if (idx.equipoId && idx.equipoId !== equipoId) {
            throw badRequest(
              `El número de serie "${body.serial}" ya se encuentra registrado.`,
            );
          }
        }

        tx.delete(currentTeamIndexRef);
        tx.set(newTeamIndexRef, {
          prefix: "equipo",
          serial: body.serial,
          serialNorm: newSerialNorm,
          equipoId,
          equipoSerial: body.serial,
          tipoEquipo,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        tx.set(
          currentTeamIndexRef,
          {
            serial: body.serial,
            serialNorm: newSerialNorm,
            equipoSerial: body.serial,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      const procedencia = await getOrCreateUbicacion(
        tx,
        body.procedencia,
        "procedencia",
      );
      const asignacion = await getOrCreateUbicacion(
        tx,
        body.asignacion,
        "asignacion",
      );

      const oldComponentes = Array.isArray(current.componentes)
        ? current.componentes
        : [];
      const oldPerifericos = Array.isArray(current.perifericos)
        ? current.perifericos
        : [];

      const newComponentes = [];
      const newPerifericos = [];

      const newComponentSerials = new Set();
      const newPerifericoSerials = new Set();

      for (let i = 0; i < body.componentes.length; i++) {
        const item = normalizeComponent(body.componentes[i], i);
        const serialNorm = normalize(item.serial);

        if (newComponentSerials.has(serialNorm)) {
          throw badRequest(
            `Hay componentes repetidos en el payload: ${item.serial}`,
          );
        }
        newComponentSerials.add(serialNorm);

        await reserveIndex(tx, {
          prefix: "componente",
          serial: item.serial,
          equipoId,
          equipoSerial: body.serial,
          tipoEquipo,
          itemType: item.tipo,
        });

        newComponentes.push({ ...item, serialNorm });
      }

      for (let i = 0; i < body.perifericos.length; i++) {
        const item = normalizePeriferico(body.perifericos[i], i);
        const serialNorm = normalize(item.serial);

        if (newPerifericoSerials.has(serialNorm)) {
          throw badRequest(
            `Hay periféricos repetidos en el payload: ${item.serial}`,
          );
        }
        newPerifericoSerials.add(serialNorm);

        await reserveIndex(tx, {
          prefix: "periferico",
          serial: item.serial,
          equipoId,
          equipoSerial: body.serial,
          tipoEquipo,
          itemType: item.tipo,
        });

        newPerifericos.push({ ...item, serialNorm });
      }

      const oldCompNorms = new Set(
        oldComponentes.map((c) => normalize(c.serial)),
      );
      const oldPeriNorms = new Set(
        oldPerifericos.map((p) => normalize(p.serial)),
      );

      for (const oldSerial of oldCompNorms) {
        if (!newComponentSerials.has(oldSerial)) {
          await releaseIndex(tx, { prefix: "componente", serial: oldSerial });
        }
      }

      for (const oldSerial of oldPeriNorms) {
        if (!newPerifericoSerials.has(oldSerial)) {
          await releaseIndex(tx, { prefix: "periferico", serial: oldSerial });
        }
      }

      tx.set(
        equipoRef,
        {
          tipo: tipoEquipo,
          marca: body.marca,
          modelo: body.modelo,
          serial: body.serial,
          serialNorm: newSerialNorm,
          estado: body.estado,
          notas: body.notas,
          fechaRegistro: current.fechaRegistro || new Date().toISOString(),
          procedencia,
          asignacion,
          componentes: newComponentes,
          perifericos: newPerifericos,
          componentesSerials: [...newComponentSerials],
          perifericosSerials: [...newPerifericoSerials],
          estadoActivo: current.estadoActivo !== false,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: current.createdAt || FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      return equipoId;
    });

    res.status(200).json({
      message: "Equipo actualizado correctamente.",
      id: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error actualizando equipo.",
      error: error.message,
    });
  }
});

//falta implementar la api de eliminación lógica

Router.get("/verificar-periferico/:dispositivo/:serial", async (req, res) => {
  const { dispositivo, serial } = req.params;
  const dispNorm = normalize(dispositivo);

  if (!PERIFERICOS_MAP[dispNorm] && !COMPONENTES_MAP[dispNorm]) {
    return res
      .status(400)
      .json({ message: "Dispositivo no registrado para búsqueda." });
  }

  try {
    const prefix = PERIFERICOS_MAP[dispNorm] ? "periferico" : "componente";
    const indexId = serialIndexId(prefix, serial);
    const snap = await db.collection(COL.indices).doc(indexId).get();

    if (!snap.exists) {
      return res.status(200).json({
        existe: false,
        asignado: false,
        message: `El ${prefix} está disponible y será registrado como nuevo.`,
      });
    }

    const data = snap.data();

    if (data.equipoId) {
      return res.status(200).json({
        existe: true,
        asignado: true,
        equipo: data.tipoEquipo || "Equipo",
        serialEquipo: data.equipoSerial || data.equipoId,
        message: `Este ${prefix} ya está asignado a un equipo (${data.tipoEquipo}) con serial: ${data.equipoSerial || data.equipoId}`,
      });
    }

    return res.status(200).json({
      existe: true,
      asignado: false,
      message: `El ${prefix} existe en la base de datos pero no está asignado a ningún equipo.`,
    });
  } catch (error) {
    console.error(`Error verificando asignación de ${dispositivo}:`, error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

Router.get("/:dispositivo/:id", async (req, res, next) => {
  const { dispositivo, id } = req.params;
  const dispNorm = normalize(dispositivo);

  let prefix = null;
  if (EQUIPOS_MAP[dispNorm] || dispNorm === "cpu") prefix = "equipo";
  else if (PERIFERICOS_MAP[dispNorm]) prefix = "periferico";
  else if (COMPONENTES_MAP[dispNorm]) prefix = "componente";

  if (!prefix) return next();

  try {
    const indexId = serialIndexId(prefix, id);
    const snap = await db.collection(COL.indices).doc(indexId).get();

    if (snap.exists) {
      return res.status(200).json([{ serial: id }]);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error(`Error obteniendo el serial en ${dispositivo}:`, error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

Router.get("/buscar/:serial", async (req, res) => {
  try {
    const serialNorm = normalize(req.params.serial);

    const snap = await db.collection(COL.equipos).get();

    const equipo = snap.docs.find(
      (doc) => normalize(doc.data().serial) === serialNorm,
    );

    if (!equipo) {
      return res.status(404).json({
        message: "Equipo no encontrado",
      });
    }

    return res.status(200).json({
      id: equipo.id,
      ...equipo.data(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error buscando equipo",
      error: error.message,
    });
  }
});

Router.get("/equipos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const equipoRef = db.collection("equipos").doc(id);
    const equipoSnap = await equipoRef.get();

    if (!equipoSnap.exists) {
      return res.status(404).json({
        message: "El equipo solicitado no existe en el inventario.",
      });
    }

    const equipoData = equipoSnap.data();

    return res.status(200).json({
      id: equipoSnap.id,
      ...equipoData,
      componentes: equipoData.componentes || [],
      perifericos: equipoData.perifericos || [],
    });
  } catch (error) {
    console.error("Error al obtener el equipo:", error);
    return res
      .status(500)
      .json({ message: "Error interno al obtener el equipo." });
  }
});
export default Router;
