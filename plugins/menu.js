import { config } from "../config.js";
import { obtenerAjustes } from "../db/ajustesDB.js";
import { obtenerNegocio } from "../db/negocioDB.js";
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

export default {
  command: ["menu", "help", "ayuda"],
  category: "General",
  description: "Muestra el menú de comandos.",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const ajustes = obtenerAjustes();
    const negocio = obtenerNegocio();
    const p = ajustes.prefix;

    let texto = `🛍️ *${negocio.nombre.toUpperCase()}*\n`;
    texto += `Bot de ventas — ${config.botName}\n`;
    texto += `━━━━━━━━━━━━━━━━━━\n\n`;

    texto += `*🛒 PARA CLIENTES*\n`;
    texto += `▸ ${p}catalogo — ver productos\n`;
    texto += `▸ ${p}ver <ID> — detalle de un producto\n`;
    texto += `▸ ${p}agregar <ID> <cant> — agregar al carrito\n`;
    texto += `▸ ${p}carrito — ver tu carrito\n`;
    texto += `▸ ${p}quitar <ID> — quitar del carrito\n`;
    texto += `▸ ${p}vaciarcarrito — vaciar carrito\n`;
    texto += `▸ ${p}confirmar — confirmar pedido\n\n`;

    texto += `*⚙️ SOLO DUEÑO DEL NEGOCIO*\n`;
    texto += `▸ ${p}addproducto Nombre | Precio | Desc | Stock\n`;
    texto += `▸ ${p}editarproducto <ID> | campo | valor\n`;
    texto += `▸ ${p}eliminarproducto <ID>\n`;
    texto += `▸ ${p}fotoproducto <ID> (responde a una imagen)\n`;
    texto += `▸ ${p}pedidos — ver pedidos activos\n`;
    texto += `▸ ${p}pedidos <ID> <estado> — actualizar estado\n`;
    texto += `▸ ${p}broadcast [lista] <mensaje> — envío masivo\n`;
    texto += `▸ ${p}addcontacto / delcontacto / listas / importargrupo\n`;
    texto += `▸ ${p}setnegocio / setbienvenida / setpago / negocio\n`;
    texto += `▸ ${p}addfaq / delfaq / verfaq — respuestas automáticas\n`;
    texto += `▸ ${p}ajustes — ver/cambiar prefijo, moneda y dueños\n\n`;

    texto += `━━━━━━━━━━━━━━━━━━\n`;
    texto += `Prefijo de comandos: *${p}*`;

    const imagen = obtenerImagenMenu();
    if (imagen) {
      await sock.sendMessage(chatId, { image: imagen, caption: texto }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
    }
  },
};
