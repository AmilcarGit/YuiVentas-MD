import { config } from "../config.js";
import { obtenerAjustes, esOwner } from "../db/ajustesDB.js";
import { obtenerNegocio } from "../db/negocioDB.js";
import { resolverNumeroReal } from "../middlewares.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MENU_IMAGE_PATH = path.join(__dirname, "..", "assets", "menu1.jpg");

function obtenerImagenMenu(negocio) {
  if (negocio.menuImagen) {
    try {
      return fs.readFileSync(negocio.menuImagen);
    } catch (_) {
      // si la imagen personalizada no se puede leer, cae a la de por defecto
    }
  }
  try {
    return fs.readFileSync(MENU_IMAGE_PATH);
  } catch (_) {
    return null;
  }
}

function menuCliente(p, negocio) {
  let t = `┏━━━━━━━━━━━━━━━━━━━┓\n`;
  t += `   🛍️ *${negocio.nombre.toUpperCase()}*\n`;
  t += `┗━━━━━━━━━━━━━━━━━━━┛\n\n`;
  t += negocio.menuIntro ? `${negocio.menuIntro}\n` : `¡Hola! Así puedes comprar con nosotros 👇\n`;
  t += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;

  t += `*01 · CATÁLOGO* 🗂️\n`;
  t += `▸ ${p}catalogo · ver todos los productos\n`;
  t += `▸ ${p}ver <ID> · ver el detalle de uno\n\n`;

  t += `*02 · CARRITO* 🛒\n`;
  t += `▸ ${p}agregar <ID> <cant> · añadir\n`;
  t += `▸ ${p}carrito · ver lo que llevas\n`;
  t += `▸ ${p}quitar <ID> · quitar un producto\n`;
  t += `▸ ${p}vaciarcarrito · vaciar todo\n\n`;

  t += `*03 · COMPRA* ✅\n`;
  t += `▸ ${p}confirmar · confirmar tu pedido\n\n`;

  t += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
  t += `💬 ¿Dudas? Solo escríbenos.`;
  return t;
}

function menuDueno(p, negocio) {
  let t = `┏━━━━━━━━━━━━━━━━━━━┓\n`;
  t += `   ⚙️ *PANEL DEL NEGOCIO*\n`;
  t += `   ${negocio.nombre}\n`;
  t += `┗━━━━━━━━━━━━━━━━━━━┛\n\n`;

  t += `*01 · PRODUCTOS* 🗂️\n`;
  t += `▸ ${p}addproducto Nombre | Precio | Desc | Stock\n`;
  t += `▸ ${p}editarproducto <ID> | campo | valor\n`;
  t += `▸ ${p}eliminarproducto <ID>\n`;
  t += `▸ ${p}fotoproducto <ID> · responde a una imagen\n\n`;

  t += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
  t += `*02 · PEDIDOS* 📦\n`;
  t += `▸ ${p}pedidos · ver pedidos activos\n`;
  t += `▸ ${p}pedidos <ID> <estado> · cambiar estado\n\n`;

  t += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
  t += `*03 · MARKETING* 📣\n`;
  t += `▸ ${p}broadcast [lista] <mensaje> · envío masivo\n`;
  t += `▸ ${p}addcontacto / delcontacto <numero> [lista]\n`;
  t += `▸ ${p}listas · ver tus listas de contactos\n`;
  t += `▸ ${p}importargrupo [lista] · importar un grupo\n`;
  t += `▸ ${p}addfaq clave | respuesta · auto-respuesta\n`;
  t += `▸ ${p}delfaq clave  /  ${p}verfaq\n\n`;

  t += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
  t += `*04 · NEGOCIO Y MENÚ* 🏷️\n`;
  t += `▸ ${p}setnegocio <nombre>\n`;
  t += `▸ ${p}setbienvenida <mensaje>\n`;
  t += `▸ ${p}setpago <datos>\n`;
  t += `▸ ${p}setmenu <texto> · personaliza el saludo\n`;
  t += `▸ ${p}setmenuimg · responde a una foto\n`;
  t += `▸ ${p}resetmenuimg · imagen por defecto\n`;
  t += `▸ ${p}negocio · ver configuración actual\n\n`;

  t += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
  t += `*05 · AJUSTES DEL BOT* 🔧\n`;
  t += `▸ ${p}setprefijo <símbolo>\n`;
  t += `▸ ${p}setmoneda <símbolo>\n`;
  t += `▸ ${p}addowner / delowner <numero>\n`;
  t += `▸ ${p}ajustes · ver todo\n\n`;

  t += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
  t += `*06 · GRUPOS* 👥 _(apagado por defecto)_\n`;
  t += `▸ ${p}activargrupo · escríbelo DENTRO del grupo\n`;
  t += `▸ ${p}desactivargrupo · apagarlo ahí\n`;
  t += `▸ ${p}gruposactivos · ver cuáles están prendidos\n\n`;

  t += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
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

    const imagen = obtenerImagenMenu(negocio);
    if (imagen) {
      await sock.sendMessage(chatId, { image: imagen, caption: texto }, { quoted: msg });
    } else {
      await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
    }
  },
};
