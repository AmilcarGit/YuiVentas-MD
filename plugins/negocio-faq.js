import { obtenerAjustes } from "../db/ajustesDB.js";
import { agregarFAQ, eliminarFAQ, listarFAQ } from "../db/faqDB.js";

export default {
  command: ["addfaq", "delfaq", "verfaq"],
  category: "Negocio",
  description: "Configura respuestas automáticas por palabra clave (embudo de ventas).",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const ajustes = obtenerAjustes();
    const comando = body.trim().split(/\s+/)[0].toLowerCase();
    const contenido = body.trim().split(/\s+/).slice(1).join(" ");

    if (comando === "addfaq") {
      const [palabraClave, ...respuestaPartes] = contenido.split("|").map((p) => p.trim());
      const respuesta = respuestaPartes.join("|").trim();

      if (!palabraClave || !respuesta) {
        await sock.sendMessage(
          chatId,
          {
            text:
              `❀ Uso: *${ajustes.prefix}addfaq palabra clave | respuesta*\n\n` +
              `Ejemplo:\n*${ajustes.prefix}addfaq horario | Atendemos de lunes a sábado, 9am a 7pm 🕒*\n\n` +
              `Cuando alguien escriba un mensaje que *contenga* esa palabra, el bot responderá automáticamente.`,
          },
          { quoted: msg }
        );
        return;
      }

      agregarFAQ(palabraClave, respuesta);
      await sock.sendMessage(chatId, { text: `✅ Respuesta automática guardada para: *${palabraClave}*` }, { quoted: msg });
      return;
    }

    if (comando === "delfaq") {
      const palabraClave = contenido.trim();
      if (!palabraClave) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${ajustes.prefix}delfaq palabra clave*` }, { quoted: msg });
        return;
      }
      const ok = eliminarFAQ(palabraClave);
      await sock.sendMessage(
        chatId,
        { text: ok ? `🗑️ Eliminada la respuesta automática para: *${palabraClave}*` : "❌ No encontré esa palabra clave." },
        { quoted: msg }
      );
      return;
    }

    // verfaq
    const lista = listarFAQ();
    if (lista.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: `📭 Aún no tienes respuestas automáticas configuradas.\nAgrega una con *${ajustes.prefix}addfaq palabra clave | respuesta*` },
        { quoted: msg }
      );
      return;
    }

    let texto = `🤖 *RESPUESTAS AUTOMÁTICAS (FAQ)*\n━━━━━━━━━━━━━━━━━━\n\n`;
    for (const { palabraClave, respuesta } of lista) {
      texto += `▸ *${palabraClave}* → ${respuesta}\n\n`;
    }
    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
