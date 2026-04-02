
// Express es el framework que convierte Node.js en un servidor web.
const express = require("express");

// app es el objeto principal. Sobre él se definen las rutas y el servidor.
const app = express();

// middleware para parsear JSON. Sin esto, req.body estaría vacío.
app.use(express.json());

//base de datos simulada con un array en memoria. Cada empleado es un objeto.
let empleados = [];
// contador para generar IDs únicos. En una base real, esto lo haría la base de datos.
let contadorId = 1;

// función utilitaria para generar IDs únicos de empleados
function generarId() {
  const id = `emp_${String(contadorId).padStart(3, "0")}`;
  contadorId++;
  return id;
}

// funcion para validar empleado

function validarEmpleado(datos) {
  const camposRequeridos = ["nombre", "cargo", "departamento", "salario", "email"];
  const faltantes = camposRequeridos.filter((campo) => !datos[campo]);

  if (faltantes.length > 0) {
    return { valido: false, error: `Campos requeridos faltantes: ${faltantes.join(", ")}` };
  }
  if (typeof datos.salario !== "number" || datos.salario <= 0) {
    return { valido: false, error: "El salario debe ser un número positivo." };
  }
  if (!datos.email.includes("@")) {
    return { valido: false, error: "El email no tiene un formato válido." };
  }
  return { valido: true };
}


// PUNTO 1: POST /api/empleados — Crear empleado 
// req = request (lo que envía el cliente)
// res = response (lo que devuelve el servidor)
app.post("/api/empleados", (req, res) => {
  const datos = req.body; // Lee el JSON del body de la petición

  // Validar los datos antes de guardar
  const { valido, error } = validarEmpleado(datos);
  if (!valido) {
    return res.status(400).json({
      status: 400,
      mensaje: "Solicitud inválida. El empleado no fue creado.",
      error: error,
    });
  }

  // Construir el objeto empleado
  const nuevoEmpleado = {
    id: generarId(),
    nombre: datos.nombre,
    cargo: datos.cargo,
    departamento: datos.departamento,
    salario: datos.salario,
    email: datos.email,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: null,
  };

  // Guardar en la "base de datos"
  empleados.push(nuevoEmpleado);

  // Responder con 201 Created y el empleado creado
  res.status(201).json({
    status: 201,
    mensaje: "Empleado creado exitosamente.",
    data: nuevoEmpleado,
  });
});

// PUNTO 2: GET /api/empleados — Listar todos
app.get("/api/empleados", (req, res) => {
  res.status(200).json({
    status: 200,
    mensaje: "Empleados obtenidos exitosamente.",
    total: empleados.length,
    data: empleados,
  });
});

// PUNTO 3: GET /api/empleados/:id — Buscar uno
// :id es un parámetro de ruta. Express lo captura en req.params.id
app.get("/api/empleados/:id", (req, res) => {
  const { id } = req.params; // Extrae el ID de la URL

  const empleado = empleados.find((e) => e.id === id);

  if (!empleado) {
    return res.status(404).json({
      status: 404,
      mensaje: `Empleado con id '${id}' no encontrado.`,
      data: null,
    });
  }

  res.status(200).json({
    status: 200,
    mensaje: "Empleado encontrado.",
    data: empleado,
  });
});

// PUNTO 4: PUT /api/empleados/:id — Actualizar uno
app.put("/api/empleados/:id", (req, res) => {
  const { id } = req.params;
  const cambios = req.body;

  const indice = empleados.findIndex((e) => e.id === id);

  if (indice === -1) {
    return res.status(404).json({
      status: 404,
      mensaje: `Empleado con id '${id}' no encontrado.`,
    });
  }

  // Campos que no se pueden modificar nunca
  const PROTEGIDOS = ["id", "fechaCreacion"];
  const camposPermitidos = Object.keys(cambios).filter(
    (k) => !PROTEGIDOS.includes(k)
  );

  camposPermitidos.forEach((campo) => {
    empleados[indice][campo] = cambios[campo];
  });
  empleados[indice].fechaActualizacion = new Date().toISOString();

  res.status(200).json({
    status: 200,
    mensaje: "Empleado actualizado exitosamente.",
    data: empleados[indice],
  });
});

// PUNTO 5: DELETE /api/empleados/:id — Eliminar uno
app.delete("/api/empleados/:id", (req, res) => {
  const { id } = req.params;

  const indice = empleados.findIndex((e) => e.id === id);

  if (indice === -1) {
    return res.status(404).json({
      status: 404,
      mensaje: `Empleado con id '${id}' no encontrado.`,
    });
  }

  const [eliminado] = empleados.splice(indice, 1);

  res.status(200).json({
    status: 200,
    mensaje: "Empleado eliminado correctamente.",
    deletedId: id,
    empleadoEliminado: eliminado,
  });
});

// INICIAR EL SERVIDOR
const PUERTO = 3000;

app.listen(PUERTO, () => {
  console.log("=".repeat(55));
  console.log("   Servidor Express corriendo");
  console.log(`   URL: http://localhost:${PUERTO}`);
  console.log("=".repeat(55));
  console.log("\nEndpoints disponibles:");
  console.log(`  POST   http://localhost:${PUERTO}/api/empleados`);
  console.log(`  GET    http://localhost:${PUERTO}/api/empleados`);
  console.log(`  GET    http://localhost:${PUERTO}/api/empleados/:id`);
  console.log(`  PUT    http://localhost:${PUERTO}/api/empleados/:id`);
  console.log(`  DELETE http://localhost:${PUERTO}/api/empleados/:id`);
  console.log("\nPresiona Ctrl + C para detener el servidor.\n");
});
