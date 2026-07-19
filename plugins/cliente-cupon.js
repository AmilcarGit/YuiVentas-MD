import { obtenerAjustes } from "../db/ajustesDB.js";
import { obtenerCupon, cuponValido, aplicarCuponACliente, calcularDescuento } from "../db/cuponesDB.js";
import { calcularResumen } from "../db/carritoDB.js";
import { resolverNumeroReal } from "../middlewares.js";

export default {
  command: ["cupon", "cupón"],
  category: "Cliente",
  description: "Aplica un cupón de descuento a tu compra. Uso: cupon <código>",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const ajustes = obtenerAjustes();
    const codigo = (args[0] || "").trim();

    if (!codigo) {
      await sock.sendMessage(chatId, { text: `❀ Uso: *${ajustes.prefix}cupon <código>*` }, { quoted: msg });
      return;
    }

    const cupon = obtenerCupon(codigo);
    if (!cupon || !cuponValido(cupon)) {
      await sock.sendMessage(chatId, { text: "❌ Ese cupón no existe o ya no está disponible." }, { quoted: msg });
      return;
    }

    const numero = await resolverNumeroReal(sock, sender, msg);
    aplicarCuponACliente(numero, cupon.codigo);

    const resumen = calcularResumen(numero);
    if (resumen.items.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: `✅ Cupón *${cupon.codigo}* guardado. Se aplicará en cuanto agregues productos y confirmes tu pedido.` },
        { quoted: msg }
      );
      return;
    }

    const descuento = calcularDescuento(cupon, resumen.total);
    const totalConDescuento = resumen.total - descuento;

    await sock.sendMessage(
      chatId,
      {
        text:
          `✅ Cupón *${cupon.codigo}* aplicado.\n\n` +
          `Subtotal: ${ajustes.monedaSimbolo}${resumen.total.toFixed(2)}\n` +
          `Descuento: -${ajustes.monedaSimbolo}${descuento.toFixed(2)}\n` +
          `*Total con descuento: ${ajustes.monedaSimbolo}${totalConDescuento.toFixed(2)}*\n\n` +
          `Escribe *${ajustes.prefix}confirmar* para cerrar tu pedido con este precio.`,
      },
      { quoted: msg }
    );
  },
};
