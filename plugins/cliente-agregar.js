import { obtenerAjustes } from "../db/ajustesDB.js";
import { obtenerProducto } from "../db/productosDB.js";
import { agregarAlCarrito, calcularResumen } from "../db/carritoDB.js";
import { resolverNumeroReal } from "../middlewares.js";

export default {
  command: ["agregar", "add"],
  category: "Cliente",
  description: "Agrega un producto a tu carrito. Uso: agregar <ID> <cantidad>",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const ajustes = obtenerAjustes();
    const id = (args[0] || "").toLowerCase();
    const cantidad = parseInt(args[1], 10) || 1;

    if (!id) {
      await sock.sendMessage(
        chatId,
        { text: `❀ Uso: *${ajustes.prefix}agregar <ID> <cantidad>*\nEjemplo: *${ajustes.prefix}agregar playera-azul 2*` },
        { quoted: msg }
      );
      return;
    }

    const producto = obtenerProducto(id);
    if (!producto || producto.activo === false) {
      await sock.sendMessage(chatId, { text: "❌ No encontré ese producto. Revisa el ID con *catalogo*." }, { quoted: msg });
      return;
    }

    if (producto.stock !== null && cantidad > producto.stock) {
      await sock.sendMessage(
        chatId,
        { text: `⚠️ Solo quedan *${producto.stock}* unidades de "${producto.nombre}".` },
        { quoted: msg }
      );
      return;
    }

    const numero = await resolverNumeroReal(sock, sender, msg);
    agregarAlCarrito(numero, id, cantidad);
    const resumen = calcularResumen(numero);

    let texto = `✅ Agregaste *${cantidad}x ${producto.nombre}* a tu carrito.\n\n`;
    texto += `🛒 Tu carrito ahora tiene ${resumen.items.length} producto(s), total: ${ajustes.monedaSimbolo}${resumen.total.toFixed(2)}\n`;
    texto += `Escribe *${ajustes.prefix}carrito* para verlo o *${ajustes.prefix}confirmar* para hacer tu pedido.`;

    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
