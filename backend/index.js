import express from "express";
import pool from "./config/bd.js";
import perifericos from "./apis/perifericos.js";
import ubicacion from "./apis/ubicacion.js";
import usuarios from "./apis/usuarios.js";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/api", perifericos);
app.use("/api", ubicacion);
app.use("/api", usuarios);

app.listen(3001, () => {
  console.log("Escuchandoo, oh oh");
});
