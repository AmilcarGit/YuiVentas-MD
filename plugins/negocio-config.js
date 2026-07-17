import { config } from "../config.js";
import { obtenerNegocio, actualizarNegocio } from "../db/negocioDB.js";

export default {
  command: ["setnegocio", "setbienvenida", "setpago", "negocio"],
  category: "Negocio",
  description: "Configura el nombre del negocio, el mensaje de bienvenida y los datos de pago.",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const comando = body.trim().split(/\s+/)[0].toLowerCase();
    const texto = body.trim().split(/\s+/).slice(1).join(" ").trim();

    if (comando === "setnegocio") {
      if (!texto) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${config.prefix}setnegocio <nombre>*` }, { quoted: msg });
        return;
      }
      actualizarNegocio({ nombre: texto });
      await sock.sendMessage(chatId, { text: `✅ Nombre del negocio actualizado a: *${texto}*` }, { quoted: msg });
      return;
    }

    if (comando === "setbienvenida") {
      if (!texto) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${config.prefix}setbienvenida <mensaje>*` }, { quoted: msg });
        return;
      }
      actualizarNegocio({ bienvenida: texto });
      await sock.sendMessage(chatId, { text: "✅ Mensaje de bienvenida actualizado." }, { quoted: msg });
      return;
    }

    if (comando === "setpago") {
      if (!texto) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${config.prefix}setpago <datos de pago>*\nEjemplo: Yape/Plin: 987654321 (Juan Pérez)` }, { quoted: msg });
        return;
      }
      actualizarNegocio({ infoPago: texto });
      await sock.sendMessage(chatId, { text: "✅ Datos de pago actualizados." }, { quoted: msg });
      return;
    }

    // "negocio" -> mostrar configuración actual
    const negocio = obtenerNegocio();
    let resumen = `⚙️ *CONFIGURACIÓN DEL NEGOCIO*\n━━━━━━━━━━━━━━━━━━\n\n`;
    resumen += `🏷️ Nombre: ${negocio.nombre}\n\n`;
    resumen += `👋 Bienvenida:\n${negocio.bienvenida}\n\n`;
    resumen += `💳 Datos de pago:\n${negocio.infoPago}\n\n`;
    resumen += `━━━━━━━━━━━━━━━━━━\n`;
    resumen += `Para cambiar:\n*${config.prefix}setnegocio <nombre>*\n*${config.prefix}setbienvenida <mensaje>*\n*${config.prefix}setpago <datos>*`;

    await sock.sendMessage(chatId, { text: resumen }, { quoted: msg });
  },
};
