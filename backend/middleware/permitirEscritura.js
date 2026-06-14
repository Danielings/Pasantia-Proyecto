export default function permitirEscritura(req, res, next) {
  if (req.usuario.rol === "Visualizador") {
    return res.status(403).json({
      message:
        "Acceso denegado. Los visualizadores no pueden editar ni eliminar.",
    });
  }
  next();
}
