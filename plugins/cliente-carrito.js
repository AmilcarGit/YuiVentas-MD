import { obtenerAjustes } from "../db/ajustesDB.js";
import { calcularResumen } from "../db/carritoDB.js";
import { resolverNumeroReal } from "../middlewares.js";

export default {
  command: ["carrito", "cart"],
  category: "Cliente",
  description: "Muestra los productos que tienes en tu carrito.",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const ajustes = obtenerAjustes();
    const numero = await resolverNumeroReal(sock, sender, msg);
    const resumen = calcularResumen(numero);

    if (resumen.items.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: `🛒 Tu carrito está vacío.\nEscribe *${ajustes.prefix}catalogo* para ver los productos.` },
        { quoted: msg }
      );
      return;
    }

    let texto = `🛒 *TU CARRITO*\n━━━━━━━━━━━━━━━━━━\n\n`;
    for (const item of resumen.items) {
      texto += `▸ ${item.cantidad}x *${item.producto.nombre}* — ${ajustes.monedaSimbolo}${item.subtotal.toFixed(2)}\n`;
    }
    texto += `\n━━━━━━━━━━━━━━━━━━\n`;
    texto += `💰 *Total: ${ajustes.monedaSimbolo}${resumen.total.toFixed(2)}*\n\n`;
    texto += `✅ Confirmar pedido: *${ajustes.prefix}confirmar*\n`;
    texto += `🗑️ Quitar un producto: *${ajustes.prefix}quitar <ID>*\n`;
    texto += `🧹 Vaciar carrito: *${ajustes.prefix}vaciarcarrito*`;

    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
