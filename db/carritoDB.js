import { crearStore } from "./jsonDB.js";
import { obtenerProducto } from "./productosDB.js";

const store = crearStore("carritos.json", {});

export function obtenerCarrito(numero) {
  const data = store.leer();
  return data[numero] || {};
}

export function agregarAlCarrito(numero, productoId, cantidad = 1) {
  const data = store.leer();
  const carrito = data[numero] || {};
  carrito[productoId] = (carrito[productoId] || 0) + cantidad;
  if (carrito[productoId] <= 0) delete carrito[productoId];
  data[numero] = carrito;
  store.escribir(data);
  return carrito;
}

export function quitarDelCarrito(numero, productoId) {
  const data = store.leer();
  const carrito = data[numero] || {};
  delete carrito[productoId];
  data[numero] = carrito;
  store.escribir(data);
  return carrito;
}

export function vaciarCarrito(numero) {
  const data = store.leer();
  data[numero] = {};
  store.escribir(data);
}

export function calcularResumen(numero) {
  const carrito = obtenerCarrito(numero);
  const items = [];
  let total = 0;

  for (const [productoId, cantidad] of Object.entries(carrito)) {
    const producto = obtenerProducto(productoId);
    if (!producto) continue;
    const subtotal = producto.precio * cantidad;
    total += subtotal;
    items.push({ producto, cantidad, subtotal });
  }

  return { items, total };
}
