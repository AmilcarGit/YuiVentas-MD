import { crearStore } from "./jsonDB.js";

const store = crearStore("ajustes.json", {
  owners: [], // números (solo dígitos) que pueden usar comandos de dueño
  prefix: ".",
  monedaSimbolo: "S/",
  broadcastDelayMs: 3000,
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
