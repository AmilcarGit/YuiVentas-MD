import { config } from "../config.js";
import { obtenerAjustes, esOwner } from "../db/ajustesDB.js";
import { obtenerNegocio } from "../db/negocioDB.js";
import { resolverNumeroReal } from "../middlewares.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MENU_IMAGE_PATH = path.join(__dirname, "..", "assets", "menu.jpg");

let imagenMenuCache = null;
function obtenerImagenMenu() {
  if (imagenMenuCache) return imagenMenuCache;
  try {
    imagenMenuCache = fs.readFileSync(MENU_IMAGE_PATH);
    return imagenMenuCache;
  } catch (_) {
    return null;
  }
}

function menuCliente(p, negocio) {
  let t = `╭─────────────────────╮\n`;
  t += `   🛍️ *${negocio.nombre.toUpperCase()}*\n`;
  t += `╰─────────────────────╯\n\n`;
  t += negocio.menuIntro ? `${negocio.menuIntro}\n\n` : `¡Hola! Así puedes comprar con nosotros 👇\n\n`;

  t += `🗂️ *VER PRODUCTOS*\n`;
  t += `  ${p}catalogo — ver todo lo disponible\n`;
  t += `  ${p}ver <ID> — ver detalle de un producto\n\n`;

  t += `🛒 *TU CARRITO*\n`;
  t += `  ${p}agregar <ID> <cant> — agregar producto\n`;
  t += `  ${p}carrito — ver lo que llevas\n`;
  t += `  ${p}quitar <ID> — quitar un producto\n`;
  t += `  ${p}vaciarcarrito — vaciar todo\n\n`;

  t += `✅ *FINALIZAR COMPRA*\n`;
  t += `  ${p}confirmar — confirmar tu pedido\n\n`;

  t += `─────────────────────\n`;
  t += `💬 ¿Dudas? Solo escríbenos.`;
  return t;
}

function menuDueno(p, negocio) {
  let t = `╭─────────────────────╮\n`;
  t += `   ⚙️ *PANEL DEL NEGOCIO*\n`;
  t += `   ${negocio.nombre}\n`;
  t += `╰─────────────────────╯\n\n`;

  t += `🗂️ *PRODUCTOS*\n`;
  t += `  ${p}addproducto Nombre | Precio | Desc | Stock\n`;
  t += `  ${p}editarproducto <ID> | campo | valor\n`;
  t += `  ${p}eliminarproducto <ID>\n`;
  t += `  ${p}fotoproducto <ID>  (responde a una imagen)\n\n`;

  t += `📦 *PEDIDOS*\n`;
  t += `  ${p}pedidos — ver pedidos activos\n`;
  t += `  ${p}pedidos <ID> <estado> — cambiar estado\n\n`;

  t += `📣 *MARKETING*\n`;
  t += `  ${p}broadcast [lista] <mensaje> — envío masivo\n`;
  t += `  ${p}addcontacto / delcontacto <numero> [lista]\n`;
  t += `  ${p}listas — ver tus listas de contactos\n`;
  t += `  ${p}importargrupo [lista] — importar un grupo\n`;
  t += `  ${p}addfaq clave | respuesta — auto-respuesta\n`;
  t += `  ${p}delfaq clave / ${p}verfaq\n\n`;

  t += `🏷️ *NEGOCIO*\n`;
  t += `  ${p}setnegocio <nombre>\n`;
  t += `  ${p}setbienvenida <mensaje>\n`;
  t += `  ${p}setpago <datos>\n`;
  t += `  ${p}setmenu <texto> — personaliza el menú de clientes\n`;
  t += `  ${p}negocio — ver configuración actual\n\n`;

  t += `🔧 *AJUSTES DEL BOT*\n`;
  t += `  ${p}setprefijo <símbolo>\n`;
  t += `  ${p}setmoneda <símbolo>\n`;
  t += `  ${p}addowner / delowner <numero>\n`;
  t += `  ${p}ajustes — ver todo\n\n`;

  t += `─────────────────────\n`;
  t += `Tus clientes solo ven el menú de compra 🙂`;
  return t;
}

export default {
  command: ["menu", "help", "ayuda"],
  category: "General",
  description: "Muestra el menú de comandos.",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const ajustes = obtenerAjustes();
    const negocio = obtenerNegocio();
    const p = ajustes.prefix;

    const numero = await resolverNumeroReal(sock, sender, msg);
    const texto = esOwner(numero) ? menuDueno(p, negocio) : menuCliente(p, negocio);

    const imagen = obtenerImagenMenu();
    if (imagen) {
      await sock.sendMessage(chatId, { image: imagen, caption: texto }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
    }
  },
};
