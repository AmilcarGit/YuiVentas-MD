import {
  obtenerAjustes,
  actualizarAjustes,
  agregarOwner,
  quitarOwner,
} from "../db/ajustesDB.js";

export default {
  command: ["ajustes", "setprefijo", "setmoneda", "addowner", "delowner", "verowners"],
  category: "Negocio",
  description: "Configura el prefijo, la moneda y los dueños del bot.",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const comando = body.trim().split(/\s+/)[0].toLowerCase();
    const ajustes = obtenerAjustes();

    if (comando === "setprefijo") {
      const nuevo = (args[0] || "").trim();
      if (!nuevo || nuevo.includes(" ") || nuevo.length > 3) {
        await sock.sendMessage(
          chatId,
          { text: `❀ Uso: *${ajustes.prefix}setprefijo <símbolo>*\nEjemplo: *${ajustes.prefix}setprefijo !*\n(máximo 3 caracteres, sin espacios)` },
          { quoted: msg }
        );
        return;
      }
      actualizarAjustes({ prefix: nuevo });
      await sock.sendMessage(chatId, { text: `✅ Prefijo actualizado. Ahora los comandos empiezan con: *${nuevo}*\nEjemplo: *${nuevo}menu*` }, { quoted: msg });
      return;
    }

    if (comando === "setmoneda") {
      const nuevo = (args[0] || "").trim();
      if (!nuevo) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${ajustes.prefix}setmoneda <símbolo>*\nEjemplo: *${ajustes.prefix}setmoneda $*` }, { quoted: msg });
        return;
      }
      actualizarAjustes({ monedaSimbolo: nuevo });
      await sock.sendMessage(chatId, { text: `✅ Símbolo de moneda actualizado a: *${nuevo}*` }, { quoted: msg });
      return;
    }

    if (comando === "addowner") {
      const numero = (args[0] || "").replace(/\D/g, "");
      if (!numero) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${ajustes.prefix}addowner <numero>*\nEjemplo: *${ajustes.prefix}addowner 51987654321*` }, { quoted: msg });
        return;
      }
      const agregado = agregarOwner(numero);
      await sock.sendMessage(
        chatId,
        { text: agregado ? `✅ ${numero} ahora también es dueño del bot.` : `ℹ️ ${numero} ya era dueño.` },
        { quoted: msg }
      );
      return;
    }

    if (comando === "delowner") {
      const numero = (args[0] || "").replace(/\D/g, "");
      const ajustesActuales = obtenerAjustes();
      if (ajustesActuales.owners.length <= 1) {
        await sock.sendMessage(chatId, { text: "⚠️ No puedes quitar al único dueño del bot. Agrega otro primero con *addowner*." }, { quoted: msg });
        return;
      }
      const quitado = quitarOwner(numero);
      await sock.sendMessage(
        chatId,
        { text: quitado ? `🗑️ ${numero} ya no es dueño del bot.` : "❌ Ese número no está en la lista de dueños." },
        { quoted: msg }
      );
      return;
    }

    if (comando === "verowners") {
      const lista = obtenerAjustes().owners;
      await sock.sendMessage(chatId, { text: `👑 *Dueños del bot:*\n${lista.map((n) => `▸ ${n}`).join("\n")}` }, { quoted: msg });
      return;
    }

    // "ajustes" -> mostrar todo
    let texto = `⚙️ *AJUSTES DEL BOT*\n━━━━━━━━━━━━━━━━━━\n\n`;
    texto += `🔣 Prefijo: *${ajustes.prefix}*\n`;
    texto += `💰 Moneda: *${ajustes.monedaSimbolo}*\n`;
    texto += `👑 Dueños: ${ajustes.owners.join(", ")}\n\n`;
    texto += `Para cambiar:\n`;
    texto += `*${ajustes.prefix}setprefijo <símbolo>*\n`;
    texto += `*${ajustes.prefix}setmoneda <símbolo>*\n`;
    texto += `*${ajustes.prefix}addowner <numero>*\n`;
    texto += `*${ajustes.prefix}delowner <numero>*\n`;
    texto += `*${ajustes.prefix}verowners*`;

    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
