import { crearStore } from "./jsonDB.js";

const store = crearStore("listas.json", { general: [] });

export function listarListas() {
  const data = store.leer();
  return Object.keys(data);
}

export function obtenerLista(nombre = "general") {
  const data = store.leer();
  return data[nombre] || [];
}

export function crearLista(nombre) {
  const data = store.leer();
  if (!data[nombre]) {
    data[nombre] = [];
    store.escribir(data);
  }
  return data[nombre];
}

export function agregarContacto(numero, nombreLista = "general") {
  const data = store.leer();
  if (!data[nombreLista]) data[nombreLista] = [];
  if (!data[nombreLista].includes(numero)) {
    data[nombreLista].push(numero);
    store.escribir(data);
    return true;
  }
  return false;
}

export function agregarContactosMasivo(numeros, nombreLista = "general") {
  const data = store.leer();
  if (!data[nombreLista]) data[nombreLista] = [];
  let agregados = 0;
  for (const numero of numeros) {
    if (!data[nombreLista].includes(numero)) {
      data[nombreLista].push(numero);
      agregados++;
    }
  }
  store.escribir(data);
  return agregados;
}

export function quitarContacto(numero, nombreLista = "general") {
  const data = store.leer();
  if (!data[nombreLista]) return false;
  const idx = data[nombreLista].indexOf(numero);
  if (idx === -1) return false;
  data[nombreLista].splice(idx, 1);
  store.escribir(data);
  return true;
}
