import { crearStore } from "./jsonDB.js";

const store = crearStore("negocio.json", {
  nombre: "Mi Negocio",
  bienvenida:
    "¡Hola! 👋 Bienvenido/a. Soy el asistente automático y puedo ayudarte a ver nuestro catálogo y tomar tu pedido.\n\nEscribe *catalogo* para ver los productos disponibles.",
  infoPago: "Aún no configuro mis métodos de pago. Escribe *setpago* para configurarlos.",
  menuIntro: "", // texto personalizado que se muestra arriba del menú de clientes (vacío = usa el saludo por defecto)
  menuImagen: "", // ruta a una imagen personalizada para el menú (vacío = usa la imagen por defecto)
  contactosVistos: [], // números que ya recibieron el mensaje de bienvenida
});

export function obtenerNegocio() {
  return store.leer();
}

export function actualizarNegocio(cambios) {
  const actual = obtenerNegocio();
  const nuevo = { ...actual, ...cambios };
  store.escribir(nuevo);
  return nuevo;
}

export function yaSaludoA(numero) {
  const data = obtenerNegocio();
  return (data.contactosVistos || []).includes(numero);
}

export function marcarSaludado(numero) {
  const data = obtenerNegocio();
  const lista = data.contactosVistos || [];
  if (!lista.includes(numero)) {
    lista.push(numero);
    actualizarNegocio({ contactosVistos: lista });
  }
}
