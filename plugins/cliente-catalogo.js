import { config } from "../config.js";
import { listarProductos } from "../db/productosDB.js";
import { obtenerNegocio } from "../db/negocioDB.js";

export default {
  command: ["catalogo", "productos", "catalog"],
  category: "Cliente",
  description: "Muestra el catálogo de productos disponibles.",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const negocio = obtenerNegocio();
    const productos = listarProductos();

    if (productos.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: "😅 Todavía no hay productos cargados en el catálogo. Vuelve pronto." },
        { quoted: msg }
      );
      return;
    }

    let texto = `🛍️ *CATÁLOGO — ${negocio.nombre}*\n`;
    texto += `━━━━━━━━━━━━━━━━━━\n\n`;

    for (const p of productos) {
      texto += `🔹 *${p.nombre}*  —  ${config.monedaSimbolo}${p.precio.toFixed(2)}\n`;
      if (p.descripcion) texto += `   ${p.descripcion}\n`;
      texto += `   ID: \`${p.id}\`\n`;
      if (p.stock !== null) texto += `   Stock: ${p.stock}\n`;
      texto += `\n`;
    }

    texto += `━━━━━━━━━━━━━━━━━━\n`;
    texto += `📸 Ver detalle: *${config.prefix}ver <ID>*\n`;
    texto += `🛒 Agregar al carrito: *${config.prefix}agregar <ID> <cantidad>*\n`;
    texto += `📦 Ver tu carrito: *${config.prefix}carrito*`;

    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
