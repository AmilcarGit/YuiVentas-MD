import fs from "fs";
import path from "path";

/**
 * Crea un mini "store" JSON persistido en disco, en ./database/<archivo>.json.
 * Todas las bases de datos del bot (productos, pedidos, contactos, etc.)
 * usan esto por debajo para no repetir la lógica de leer/escribir archivos.
 */
export function crearStore(nombreArchivo, valorInicial) {
  const DB_PATH = path.join("./database", nombreArchivo);

  function asegurarDB() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(valorInicial, null, 2));
    }
  }

  function leer() {
    asegurarDB();
    try {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    } catch (_) {
      return valorInicial;
    }
  }

  function escribir(data) {
    asegurarDB();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  return { leer, escribir };
}
