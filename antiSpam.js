// Anti-spam simple, en memoria (no se guarda en disco: al reiniciar el
// bot todos empiezan "limpios" de nuevo, lo cual está bien para este uso).

const VENTANA_MS = 10_000; // ventana de tiempo que se analiza
const MAX_MENSAJES = 8; // mensajes permitidos dentro de la ventana
const BLOQUEO_MS = 30_000; // cuánto tiempo queda "silenciado" al pasarse

const historial = new Map(); // numero -> [timestamps]
const bloqueadosHasta = new Map(); // numero -> timestamp hasta el que está bloqueado

/**
 * Registra un mensaje del número y evalúa si debe ser bloqueado.
 * Devuelve:
 *  - { bloqueado: false }                      → todo normal, procesar el mensaje
 *  - { bloqueado: true, avisar: true }          → se acaba de pasar del límite, avisarle una vez
 *  - { bloqueado: true, avisar: false }         → ya está en cooldown, ignorar en silencio
 */
export function evaluarMensaje(numero) {
  const ahora = Date.now();

  const hasta = bloqueadosHasta.get(numero);
  if (hasta && ahora < hasta) {
    return { bloqueado: true, avisar: false };
  }
  if (hasta && ahora >= hasta) {
    bloqueadosHasta.delete(numero);
    historial.delete(numero);
  }

  const timestamps = (historial.get(numero) || []).filter((t) => ahora - t < VENTANA_MS);
  timestamps.push(ahora);
  historial.set(numero, timestamps);

  if (timestamps.length > MAX_MENSAJES) {
    bloqueadosHasta.set(numero, ahora + BLOQUEO_MS);
    return { bloqueado: true, avisar: true };
  }

  return { bloqueado: false };
}
