import { obtenerAjustes, esGrupoActivo, activarGrupo, desactivarGrupo } from "../db/ajustesDB.js";

export default {
  command: ["activargrupo", "desactivargrupo", "gruposactivos"],
  category: "Negocio",
  description: "Activa o desactiva el bot dentro de un grupo. El bot está apagado en grupos por defecto.",
  ownerOnly: true,
  // Permite que estos comandos funcionen aunque el grupo esté desactivado,
  // para que el dueño lo pueda PRENDER desde adentro del propio grupo.
  bypassGrupoInactivo: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const comando = body.trim().split(/\s+/)[0].toLowerCase();
    const ajustes = obtenerAjustes();

    if (comando === "gruposactivos") {
      const lista = ajustes.gruposActivos || [];
      if (lista.length === 0) {
        await sock.sendMessage(chatId, { text: "📭 El bot no está activo en ningún grupo por ahora." }, { quoted: msg });
        return;
      }
      let texto = `📋 *GRUPOS DONDE EL BOT ESTÁ ACTIVO*\n\n`;
      for (const jid of lista) texto += `▸ ${jid}\n`;
      await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
      return;
    }

    if (!chatId.endsWith("@g.us")) {
      await sock.sendMessage(
        chatId,
        { text: `❀ *${comando}* solo funciona escrito DENTRO del grupo que quieres activar o desactivar.` },
        { quoted: msg }
      );
      return;
    }

    if (comando === "activargrupo") {
      const ok = activarGrupo(chatId);
      await sock.sendMessage(
        chatId,
        { text: ok ? "✅ Bot activado en este grupo. Ya responde a los comandos aquí." : "ℹ️ El bot ya estaba activo en este grupo." },
        { quoted: msg }
      );
      return;
    }

    if (comando === "desactivargrupo") {
      const ok = desactivarGrupo(chatId);
      await sock.sendMessage(
        chatId,
        { text: ok ? "🔕 Bot desactivado en este grupo." : "ℹ️ El bot ya estaba desactivado aquí." },
        { quoted: msg }
      );
      return;
    }
  },
};
