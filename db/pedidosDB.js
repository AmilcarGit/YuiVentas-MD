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
    atendidoPor: null, // { numero, nombre } del vendedor que tomó este pedido, o null
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

/** Asigna un pedido a un vendedor. Falla si ya lo tomó alguien más. */
export function tomarPedido(id, numero, nombre) {
  const data = store.leer();
  const pedido = data.pedidos[id];
  if (!pedido) return { ok: false, motivo: "no_existe" };
  if (pedido.atendidoPor && pedido.atendidoPor.numero !== numero) {
    return { ok: false, motivo: "ya_tomado", pedido };
  }
  pedido.atendidoPor = { numero, nombre: nombre || numero };
  store.escribir(data);
  return { ok: true, pedido };
}

export function liberarPedido(id) {
  const data = store.leer();
  const pedido = data.pedidos[id];
  if (!pedido) return { ok: false, motivo: "no_existe" };
  pedido.atendidoPor = null;
  store.escribir(data);
  return { ok: true, pedido };
}
