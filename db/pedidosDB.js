import { crearStore } from "./jsonDB.js";

const store = crearStore("pedidos.json", { ultimoId: 0, pedidos: {} });

export function crearPedido({ numero, nombreCliente, items, total, cupon = null, descuento = 0, subtotal = null }) {
  const data = store.leer();
  const id = String(data.ultimoId + 1).padStart(4, "0");

  data.ultimoId += 1;
  data.pedidos[id] = {
    id,
    numero,
    nombreCliente: nombreCliente || numero,
    items, // [{ productoId, nombre, precio, cantidad, subtotal }]
    subtotal: subtotal !== null ? subtotal : total,
    cupon, // código del cupón usado, o null
    descuento, // monto de descuento aplicado
    total,
    estado: "pendiente", // pendiente | confirmado | enviado | entregado | cancelado
    creadoEn: Date.now(),
  };

  store.escribir(data);
  return data.pedidos[id];
}

export function obtenerPedido(id) {
  const data = store.leer();
  return data.pedidos[id] || null;
}

export function listarPedidos({ estado = null } = {}) {
  const data = store.leer();
  const lista = Object.values(data.pedidos);
  const filtrados = estado ? lista.filter((p) => p.estado === estado) : lista;
  return filtrados.sort((a, b) => b.creadoEn - a.creadoEn);
}

export function actualizarEstadoPedido(id, estado) {
  const data = store.leer();
  if (!data.pedidos[id]) return null;
  data.pedidos[id].estado = estado;
  store.escribir(data);
  return data.pedidos[id];
}
