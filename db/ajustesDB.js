import { crearStore } from "./jsonDB.js";

const store = crearStore("ajustes.json", {
  owners: [], // números (solo dígitos) que pueden usar comandos de dueño (control total)
  vendedores: [], // números que pueden atender pedidos, pero no administrar el negocio
  prefix: "", // vacío = comandos sin símbolo, ej. "catalogo" en vez de ".catalogo"
  monedaSimbolo: "S/",
  broadcastDelayMs: 3000,
  gruposActivos: [], // JIDs de grupos donde el bot SÍ responde (vacío = apagado en todos)
});

export function obtenerAjustes() {
  return store.leer();
}

export function actualizarAjustes(cambios) {
  const actual = obtenerAjustes();
  const nuevo = { ...actual, ...cambios };
  store.escribir(nuevo);
  return nuevo;
}

export function esOwner(numero) {
  const ajustes = obtenerAjustes();
  return (ajustes.owners || []).includes(String(numero || "").replace(/\D/g, ""));
}

export function agregarOwner(numero) {
  const ajustes = obtenerAjustes();
  const limpio = String(numero || "").replace(/\D/g, "");
  if (!limpio) return false;
  if (ajustes.owners.includes(limpio)) return false;
  ajustes.owners.push(limpio);
  store.escribir(ajustes);
  return true;
}

export function quitarOwner(numero) {
  const ajustes = obtenerAjustes();
  const limpio = String(numero || "").replace(/\D/g, "");
  const idx = ajustes.owners.indexOf(limpio);
  if (idx === -1) return false;
  ajustes.owners.splice(idx, 1);
  store.escribir(ajustes);
  return true;
}

/**
 * Si todavía no hay ningún dueño registrado (primera vez que se instala
 * el bot), registra automáticamente el número con el que se vinculó el
 * bot como el primer dueño. Así nadie tiene que tocar config.js.
 */
export function asegurarPrimerOwner(numero) {
  const ajustes = obtenerAjustes();
  if ((ajustes.owners || []).length === 0) {
    agregarOwner(numero);
    return true;
  }
  return false;
}

export function esGrupoActivo(chatId) {
  const ajustes = obtenerAjustes();
  return (ajustes.gruposActivos || []).includes(chatId);
}

export function activarGrupo(chatId) {
  const ajustes = obtenerAjustes();
  if (!ajustes.gruposActivos) ajustes.gruposActivos = [];
  if (ajustes.gruposActivos.includes(chatId)) return false;
  ajustes.gruposActivos.push(chatId);
  store.escribir(ajustes);
  return true;
}

export function desactivarGrupo(chatId) {
  const ajustes = obtenerAjustes();
  const idx = (ajustes.gruposActivos || []).indexOf(chatId);
  if (idx === -1) return false;
  ajustes.gruposActivos.splice(idx, 1);
  store.escribir(ajustes);
  return true;
}

export function esVendedor(numero) {
  const ajustes = obtenerAjustes();
  return (ajustes.vendedores || []).includes(String(numero || "").replace(/\D/g, ""));
}

/** Dueño o vendedor: cualquiera de los dos puede atender pedidos. */
export function esVendedorOAdmin(numero) {
  return esOwner(numero) || esVendedor(numero);
}

export function agregarVendedor(numero) {
  const ajustes = obtenerAjustes();
  const limpio = String(numero || "").replace(/\D/g, "");
  if (!limpio) return false;
  if (!ajustes.vendedores) ajustes.vendedores = [];
  if (ajustes.vendedores.includes(limpio)) return false;
  ajustes.vendedores.push(limpio);
  store.escribir(ajustes);
  return true;
}

export function quitarVendedor(numero) {
  const ajustes = obtenerAjustes();
  const limpio = String(numero || "").replace(/\D/g, "");
  const idx = (ajustes.vendedores || []).indexOf(limpio);
  if (idx === -1) return false;
  ajustes.vendedores.splice(idx, 1);
  store.escribir(ajustes);
  return true;
}
