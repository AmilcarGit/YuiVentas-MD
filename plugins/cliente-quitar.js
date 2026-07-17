import { config } from "../config.js";
import { quitarDelCarrito, vaciarCarrito } from "../db/carritoDB.js";
import { resolverNumeroReal } from "../middlewares.js";

export default {
  command: ["quitar", "remove"],
  category: "Cliente",
  description: "Quita un producto de tu carrito. Uso: quitar <ID>",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const id = (args[0] || "").toLowerCase();

    if (!id) {
      await sock.sendMessage(chatId, { text: `❀ Uso: *${config.prefix}quitar <ID>*` }, { quoted: msg });
      return;
    }

    const numero = await resolverNumeroReal(sock, sender, msg);
    quitarDelCarrito(numero, id);

    await sock.sendMessage(
      chatId,
      { text: `🗑️ Listo, quité ese producto de tu carrito.\nEscribe *${config.prefix}carrito* para ver cómo quedó.` },
      { quoted: msg }
    );
  },
};
