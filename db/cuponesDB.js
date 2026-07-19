import { crearStore } from "./jsonDB.js";

const storeCupones = crearStore("cupones.json", {});
const storeAplicados = crearStore("cupones_aplicados.json", {});

/**
 * valor: "20%" para porcentaje, o "15" (número plano) para un monto fijo
 * de descuento en la moneda del negocio.
 */
export function crearCupon(codigo, valor, usosMax = null) {
  const data = storeCupones.leer();
  const clave = codigo.toUpperCase().trim();
  data[clave] = {
    codigo: clave,
    valor: String(valor).trim(),
    usosMax: usosMax || null,
    usosActuales: 0,
    activo: true,
    creadoEn: Date.now(),
  };
  storeCupones.escribir(data);
  return data[clave];
}

export function obtenerCupon(codigo) {
  const data = storeCupones.leer();
  return data[(codigo || "").toUpperCase().trim()] || null;
}

export function listarCupones() {
  const data = storeCupones.leer();
  return Object.values(data);
}

export function eliminarCupon(codigo) {
  const data = storeCupones.leer();
  const clave = (codigo || "").toUpperCase().trim();
  if (!data[clave]) return false;
  delete data[clave];
  storeCupones.escribir(data);
  return true;
}

export function registrarUso(codigo) {
  const data = storeCupones.leer();
  const clave = (codigo || "").toUpperCase().trim();
  if (!data[clave]) return;
  data[clave].usosActuales += 1;
  storeCupones.escribir(data);
}

/** Calcula el descuento en dinero que corresponde a un cupón sobre un total. */
export function calcularDescuento(cupon, total) {
  if (!cupon) return 0;
  if (cupon.valor.endsWith("%")) {
    const porcentaje = parseFloat(cupon.valor) || 0;
    return Math.min(total, total * (porcentaje / 100));
  }
  const monto = parseFloat(cupon.valor) || 0;
  return Math.min(total, monto);
}

export function cuponValido(cupon) {
  if (!cupon || !cupon.activo) return false;
  if (cupon.usosMax && cupon.usosActuales >= cupon.usosMax) return false;
  return true;
}

// --- Cupón aplicado (uno por cliente, pendiente de usarse en su próxima compra) ---

export function aplicarCuponACliente(numero, codigo) {
  const data = storeAplicados.leer();
  data[numero] = codigo.toUpperCase().trim();
  storeAplicados.escribir(data);
}

export function obtenerCuponDeCliente(numero) {
  const data = storeAplicados.leer();
  return data[numero] || null;
}

export function quitarCuponDeCliente(numero) {
  const data = storeAplicados.leer();
  if (!data[numero]) return;
  delete data[numero];
  storeAplicados.escribir(data);
}
