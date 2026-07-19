import { obtenerAjustes } from "../db/ajustesDB.js";
import { listarProductos } from "../db/productosDB.js";

export default {
  command: ["buscar", "search"],
  category: "Cliente",
  description: "Busca productos por nombre. Uso: buscar <palabra>",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const ajustes = obtenerAjustes();
    const consulta = args.join(" ").trim().toLowerCase();

    if (!consulta) {
      await sock.sendMessage(
        chatId,
        { text: `❀ Uso: *${ajustes.prefix}buscar <palabra>*\nEjemplo: *${ajustes.prefix}buscar playera*` },
        { quoted: msg }
      );
      return;
    }

    const productos = listarProductos().filter(
      (p) =>
        p.nombre.toLowerCase().includes(consulta) ||
        (p.descripcion || "").toLowerCase().includes(consulta)
    );

    if (productos.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: `🔍 No encontré productos que coincidan con "${consulta}".\nEscribe *${ajustes.prefix}catalogo* para ver todo lo disponible.` },
        { quoted: msg }
      );
      return;
    }

    let texto = `🔍 *RESULTADOS PARA "${consulta}"*\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;
    for (const p of productos) {
      texto += `🔹 *${p.nombre}* — ${ajustes.monedaSimbolo}${p.precio.toFixed(2)}\n`;
      texto += `   ID: \`${p.id}\`\n\n`;
    }
    texto += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    texto += `📸 Ver detalle: *${ajustes.prefix}ver <ID>*`;

    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
