import express from "express";
import pool from "./config/bd.js";

const app = express();

app.listen(3001, () => {
  console.log("Escuchandoo, oh oh");
});
