import { crearStore } from "./jsonDB.js";

const store = crearStore("productos.json", {});

function generarId(nombre) {
  const base = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || `producto-${Date.now()}`;
}

export function listarProductos({ soloActivos = true } = {}) {
  const data = store.leer();
  return Object.values(data)
    .filter((p) => (soloActivos ? p.activo !== false : true))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function obtenerProducto(id) {
  const data = store.leer();
  return data[id] || null;
}

export function crearProducto({ nombre, precio, descripcion = "", stock = null }) {
  const data = store.leer();
  let id = generarId(nombre);
  let sufijo = 2;
  while (data[id]) {
    id = `${generarId(nombre)}-${sufijo}`;
    sufijo++;
  }

  data[id] = {
    id,
    nombre,
    precio: Number(precio) || 0,
    descripcion,
    stock, // null = stock ilimitado / no controlado
    imagen: null,
    activo: true,
    creadoEn: Date.now(),
  };

  store.escribir(data);
  return data[id];
}

export function editarProducto(id, cambios) {
  const data = store.leer();
  if (!data[id]) return null;
  data[id] = { ...data[id], ...cambios };
  store.escribir(data);
  return data[id];
}

export function eliminarProducto(id) {
  const data = store.leer();
  if (!data[id]) return false;
  delete data[id];
  store.escribir(data);
  return true;
}

export function establecerImagen(id, rutaOBuffer64) {
  return editarProducto(id, { imagen: rutaOBuffer64 });
}

export function descontarStock(id, cantidad) {
  const producto = obtenerProducto(id);
  if (!producto || producto.stock === null) return true;
  if (producto.stock < cantidad) return false;
  editarProducto(id, { stock: producto.stock - cantidad });
  return true;
}
