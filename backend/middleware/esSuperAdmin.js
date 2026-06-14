export default function esSuperAdmin(req, res, next) {
  if (req.usuario.rol !== "Superadministrador") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Requiere ser Superadministrador." });
  }
  next();
}
