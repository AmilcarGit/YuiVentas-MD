import fs from "fs";
import { obtenerAjustes } from "../db/ajustesDB.js";
import { obtenerProducto } from "../db/productosDB.js";

export default {
  command: ["ver", "producto"],
  category: "Cliente",
  description: "Muestra el detalle de un producto. Uso: ver <ID>",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const ajustes = obtenerAjustes();
    const id = (args[0] || "").toLowerCase();

    if (!id) {
      await sock.sendMessage(
        chatId,
        { text: `❀ Uso: *${ajustes.prefix}ver <ID>*\nRevisa los IDs con *${ajustes.prefix}catalogo*` },
        { quoted: msg }
      );
      return;
    }

    const producto = obtenerProducto(id);
    if (!producto || producto.activo === false) {
      await sock.sendMessage(chatId, { text: "❌ No encontré ese producto. Revisa el ID con *catalogo*." }, { quoted: msg });
      return;
    }

    let texto = `🔹 *${producto.nombre}*\n\n`;
    if (producto.descripcion) texto += `${producto.descripcion}\n\n`;
    texto += `💵 Precio: ${ajustes.monedaSimbolo}${producto.precio.toFixed(2)}\n`;
    if (producto.stock !== null) texto += `📦 Stock: ${producto.stock}\n`;
    texto += `\n🛒 Para agregarlo escribe:\n*${ajustes.prefix}agregar ${producto.id} 1*`;

    if (producto.imagen && fs.existsSync(producto.imagen)) {
      await sock.sendMessage(
        chatId,
        { image: fs.readFileSync(producto.imagen), caption: texto },
        { quoted: msg }
      );
    } else {
      await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
    }
  },
};
