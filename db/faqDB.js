import { crearStore } from "./jsonDB.js";

const store = crearStore("faq.json", {});

export function listarFAQ() {
  const data = store.leer();
  return Object.entries(data).map(([palabraClave, respuesta]) => ({
    palabraClave,
    respuesta,
  }));
}

export function agregarFAQ(palabraClave, respuesta) {
  const data = store.leer();
  data[palabraClave.toLowerCase().trim()] = respuesta;
  store.escribir(data);
}

export function eliminarFAQ(palabraClave) {
  const data = store.leer();
  const clave = palabraClave.toLowerCase().trim();
  if (!data[clave]) return false;
  delete data[clave];
  store.escribir(data);
  return true;
}

/**
 * Busca si el texto del mensaje contiene alguna palabra clave registrada.
 * Devuelve la respuesta configurada, o null si ninguna coincide.
 */
export function buscarRespuesta(textoMensaje) {
  const data = store.leer();
  const texto = textoMensaje.toLowerCase();

  for (const [palabraClave, respuesta] of Object.entries(data)) {
    if (texto.includes(palabraClave)) {
      return respuesta;
    }
  }

  return null;
}
