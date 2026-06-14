//esta función es para la bitacora, para que a la hora de cambiar almacene temporalmente la información anterior y le indique al sistema que es lo que se modifico y que es lo nuevo.
export function generarCambios(oldData, newData) {
  const cambios = [];
  // Campos a monitorear
  const campos = ["telefono", "rol", "nombre", "apellido", "correo"];

  campos.forEach((campo) => {
    if (oldData[campo] !== newData[campo] && newData[campo] !== undefined) {
      cambios.push(
        `${campo.charAt(0).toUpperCase() + campo.slice(1)} modificado: Antes [${oldData[campo]}] Ahora [${newData[campo]}]`,
      );
    }
  });

  // Caso especial: Ubicación
  if (JSON.stringify(oldData.ubicacion) !== JSON.stringify(newData.ubicacion)) {
    cambios.push("Ubicación modificada");
  }

  // Caso especial: Password
  if (newData.password && newData.password !== oldData.password) {
    cambios.push("Cambio de clave realizado");
  }

  return cambios;
}
