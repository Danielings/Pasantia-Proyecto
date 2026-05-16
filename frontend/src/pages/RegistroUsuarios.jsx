import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import {
  FiSave,
  FiX,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "../validators/userSchema";
import { useUbicaciones } from "../controllers/useUbicacion.js";
import UserModal from "./Users/UserModal";

const inputClass = ({ hasError, isSuccess }) => `
  block w-60 rounded-lg shadow-sm py-2 px-3 text-sm border transition-all duration-200 outline-none bg-white
  hover:border-gray-400
  ${
    hasError
      ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500 placeholder-red-300"
      : isSuccess
        ? "border-green-400 focus:ring-2 focus:ring-green-200 focus:border-green-500"
        : "border-gray-300 focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
  }
`;

export default function RegistroUsuarios() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getFieldState,
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      cedula: "",
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      usuario: "",
      password: "",
      rol: "",
      region: "",
      city: "",
      estado: "",
      sede: "",
      piso: "",
      ala: "",
    },
  });

  const [users, setUsers] = useState([]);
  const regionActual = watch("region");
  const estadoActual = watch("estado");
  const ciudadActual = watch("city");
  const sedeActual = watch("sede");

  const {
    regionList,
    estadoList,
    ciudadesList,
    sedeList,
    pisoList,
    alaList,
    setEstadoList,
    setCiudadesList,
  } = useUbicaciones({ regionActual, estadoActual, ciudadActual, sedeActual });

  // Valores adicionales requeridos para los select controlados en tu JSX
  const alaActual = watch("ala");
  const pisoActual = watch("piso");

  const [activeDropdown, setActiveDropdown] = useState(null);

  // Estado para controlar el modal: si está abierto, qué acción es y qué usuario seleccionaste
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null, // Puede ser 'view', 'edit', o 'delete'
    user: null,
  });

  // Función para abrir/cerrar el menú de los 3 puntitos
  const toggleDropdown = (cedula) => {
    if (activeDropdown === cedula) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(cedula);
    }
  };

  // Función para abrir el modal y cerrar el menú
  const handleOpenModal = (type, user) => {
    setModalConfig({ isOpen: true, type, user });
    setActiveDropdown(null); // Cerramos el menú al hacer click
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, type: null, user: null });
  };

  const obtenerUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/usuarios");
      setUsers(response.data);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const getFieldProps = (name) => {
    const state = getFieldState(name);
    return {
      className: inputClass({
        hasError: state.invalid,
        isSuccess: state.isDirty && !state.invalid,
      }),
      error: state.invalid ? errors[name]?.message : null,
    };
  };
  //Para envíar los datos
  const onSubmit = async (data) => {
    console.log(data);
    try {
      const payload = {
        id_region: Number(data.region) || null,
        id_estado: Number(data.estado) || null,
        id_ciudad: Number(data.city || data.id_ciudad) || null,
        id_sede: Number(data.sede) || null,
        id_piso: Number(data.piso) || null,
        id_ala: data.ala ? Number(data.ala) : null,

        username: data.usuario,
        password: data.password,
        rol: data.rol,
        cedula: data.cedula,
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.email,
        telefono: data.telefono,
        estado_persona: "activo",
      };

      const response = await axios.post(
        "http://localhost:3001/api/usuarios",
        payload,
      );
      alert(response.data.message || "Listo beibi");

      reset();
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al guardar en la base de datos:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || "Error del servidor"}`);
      } else {
        alert("Ocurrió un error de red al intentar conectar con el servidor.");
      }
    }
  };

  // Función auxiliar para actualizar campos específicos dinámicamente
  const handleFieldChange = (field, value) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Registro de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Crea usuarios y visualiza el listado de registrados.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Formulario */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-primary-900 px-6 sm:px-8 py-5 sm:py-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Nuevo Usuario
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  Completa la información requerida para crear el acceso.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit, (erroresInvalidos) =>
                  console.log("Errores de Zod:", erroresInvalidos),
                )}
                className="p-4 sm:p-6 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="V-12345678"
                      {...register("cedula", {
                        onChange: (e) => {
                          const nums = e.target.value
                            .replace(/^V-?/, "")
                            .replace(/\D/g, "")
                            .slice(0, 8);
                          e.target.value = nums ? `V-${nums}` : "";
                        },
                        pattern: {
                          value: /^V-\d{1,8}$/,
                          message: "La cédula debe tener el formato V-12345678",
                        },
                      })}
                      className={getFieldProps("cedula").className}
                    />
                    {getFieldProps("cedula").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("cedula").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      {...register("nombre")}
                      className={getFieldProps("nombre").className}
                    />
                    {getFieldProps("nombre").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("nombre").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Apellido"
                      {...register("apellido")}
                      className={getFieldProps("apellido").className}
                    />
                    {getFieldProps("apellido").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("apellido").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="04XX-XXXXXXX"
                      {...register("telefono")}
                      className={getFieldProps("telefono").className}
                    />
                    {getFieldProps("telefono").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("telefono").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Usuario"
                      {...register("usuario")}
                      className={getFieldProps("usuario").className}
                    />
                    {getFieldProps("usuario").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("usuario").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("rol")}
                      className={getFieldProps("rol").className}
                    >
                      <option value="">-- Selecciona --</option>
                      <option value="Superadmin">Superadministrador</option>
                      <option value="Admin">Administrador</option>
                      <option value="Visualizador">Visualizador</option>
                    </select>
                    {getFieldProps("rol").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("rol").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="nombre.apellido@cantv.com"
                      {...register("email")}
                      className={getFieldProps("email").className}
                    />
                    {getFieldProps("email").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("email").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      className={getFieldProps("password").className}
                    />
                    {getFieldProps("password").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("password").error}
                      </p>
                    )}
                    {!getFieldProps("password").error && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 6 caracteres.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("region")}
                      className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={regionActual || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleFieldChange("region", val);
                        setValue("estado", "");
                        setValue("city", "");
                        setValue("sede", "");
                        setEstadoList([]);
                        setCiudadesList([]);
                      }}
                      disabled={regionList.length === 0} // Se bloquea si no hay estado
                    >
                      <option value="">Seleccione la region</option>
                      {regionList.map((cd) => (
                        <option key={cd.id_region} value={cd.id_region}>
                          {cd.region}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("region").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("region").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("estado")}
                      className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={estadoActual || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleFieldChange("estado", val);
                        setValue("city", "");
                        setValue("sede", "");
                        setCiudadesList([]);
                      }}
                      disabled={!regionActual || estadoList.length === 0} // Se bloquea si no hay estado
                    >
                      <option value="">Seleccione el estado</option>
                      {estadoList.map((cd) => (
                        <option key={cd.id_estado} value={cd.id_estado}>
                          {cd.estados}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("estado").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("estado").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("city")}
                      className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={ciudadActual || ""}
                      onChange={(e) =>
                        handleFieldChange("city", e.target.value)
                      }
                      disabled={!estadoActual || ciudadesList.length === 0} // Se bloquea si no hay estado
                    >
                      <option value="">Seleccione la ciudad</option>
                      {ciudadesList.map((cd) => (
                        <option key={cd.id_ciudad} value={cd.id_ciudad}>
                          {cd.ciudad}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("city").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("city").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Sede/Torre <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("sede")}
                      className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={sedeActual || ""}
                      onChange={(e) =>
                        handleFieldChange("sede", e.target.value)
                      }
                      disabled={!ciudadActual || sedeList.length === 0}
                    >
                      <option value="">Seleccione Sede o Torre</option>
                      {sedeList.map((Tow) => (
                        <option key={Tow.id_sede} value={Tow.id_sede}>
                          {Tow.sede}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("sede").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("sede").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Piso <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("piso")}
                      required
                      className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={pisoActual || ""}
                      onChange={(e) =>
                        handleFieldChange("piso", e.target.value)
                      }
                      disabled={!sedeActual || pisoList.length === 0}
                    >
                      <option value="">Seleccione Piso</option>
                      {pisoList.map((piso) => (
                        <option key={piso.id_piso} value={piso.id_piso}>
                          {piso.piso}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("piso").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("piso").error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Ala <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("ala")}
                      className="w-full bg-white border-gray-300 rounded-lg py-2 px-3 border outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={alaActual || ""}
                      onChange={(e) => handleFieldChange("ala", e.target.value)}
                      disabled={alaList.length === 0}
                    >
                      <option value="">Seleccione Ala</option>
                      {alaList.map((ala) => (
                        <option key={ala.id_ala} value={ala.id_ala}>
                          {ala.ala}
                        </option>
                      ))}
                    </select>
                    {getFieldProps("ala").error && (
                      <p className="text-xs text-red-600 mt-1">
                        {getFieldProps("ala").error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="w-full sm:w-auto group inline-flex items-center justify-center px-6 py-3 sm:py-2.5 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
                  >
                    <FiX className="mr-2 -ml-1 h-4 w-4 group-hover:text-red-600 transition-colors" />
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
                  >
                    <FiSave className="mr-2 -ml-1 h-4 w-4" />
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Tabla */}
          <section>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 sm:px-8 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">
                  Usuarios Registrados
                </h2>
              </div>

              <div>
                <table className="min-w-[768px] w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      {[
                        "Cédula",
                        "Nombre",
                        "Apellido",
                        "Usuario",
                        "Rol",
                        "Correo",
                        "Sede",
                      ].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* u.cedula es usado como llave primaria única */}
                    {users.map((u) => (
                      <tr
                        key={u.cedula}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {u.cedula}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {u.nombre}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.apellido}
                        </td>
                        {/* Se cambió u.usuario por u.username según la API */}
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.username}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize " +
                              (u.rol === "Superadministrador"
                                ? "bg-primary-50 text-primary-800"
                                : "bg-gray-100 text-gray-800")
                            }
                          >
                            {u.rol}
                          </span>
                        </td>
                        {/* Se cambió u.email por u.correo según la API */}
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.correo}
                        </td>

                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {u.sede || "N/A"}
                        </td>
                        {/* CELDA DE ACCIONES */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                          <button
                            onClick={() => toggleDropdown(u.cedula)}
                            className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <FiMoreVertical className="w-5 h-5 mx-auto" />
                          </button>

                          {/* MENÚ DESPLEGABLE */}
                          {activeDropdown === u.cedula && (
                            <div className="absolute right-8 top-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden text-left flex flex-col">
                              <button
                                onClick={() => handleOpenModal("view", u)}
                                className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 flex items-center gap-2 transition-colors"
                              >
                                <FiEye className="w-4 h-4" /> Ver más
                              </button>
                              <button
                                onClick={() => handleOpenModal("edit", u)}
                                className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                              >
                                <FiEdit className="w-4 h-4" /> Editar
                              </button>
                              <button
                                onClick={() => handleOpenModal("delete", u)}
                                className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100"
                              >
                                <FiTrash2 className="w-4 h-4" /> Eliminar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No hay usuarios registrados todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
      <UserModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        user={modalConfig.user}
        type={modalConfig.type}
      />
    </div>
  );
}
