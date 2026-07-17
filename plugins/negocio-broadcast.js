import { config } from "../config.js";
import { obtenerLista, listarListas } from "../db/contactosDB.js";

export default {
  command: ["broadcast", "difusion"],
  category: "Negocio",
  description: "Envía un mensaje a todos los contactos de una lista. Uso: broadcast [lista] <mensaje>",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;

    let resto = body.trim().split(/\s+/).slice(1);
    let nombreLista = "general";

    const listasExistentes = listarListas();
    if (resto.length > 0 && listasExistentes.includes(resto[0].toLowerCase())) {
      nombreLista = resto[0].toLowerCase();
      resto = resto.slice(1);
    }

    const mensaje = resto.join(" ").trim();

    if (!mensaje) {
      await sock.sendMessage(
        chatId,
        {
          text:
            `❀ Uso: *${config.prefix}broadcast [lista] <mensaje>*\n\n` +
            `Ejemplo: *${config.prefix}broadcast Tenemos 20% de descuento hoy 🎉*\n\n` +
            `Listas disponibles: ${listasExistentes.join(", ") || "general"}`,
        },
        { quoted: msg }
      );
      return;
    }

    const contactos = obtenerLista(nombreLista);
    if (contactos.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: `📭 La lista *${nombreLista}* está vacía. Agrega números con *${config.prefix}addcontacto <numero>*.` },
        { quoted: msg }
      );
      return;
    }

    await sock.sendMessage(
      chatId,
      { text: `📤 Enviando a ${contactos.length} contacto(s) de la lista *${nombreLista}*... esto puede tardar unos minutos.` },
      { quoted: msg }
    );

    let enviados = 0;
    let fallidos = 0;

    for (const numero of contactos) {
      try {
        await sock.sendMessage(`${numero}@s.whatsapp.net`, { text: mensaje });
        enviados++;
      } catch (_) {
        fallidos++;
      }
      await new Promise((r) => setTimeout(r, config.broadcastDelayMs));
    }

    await sock.sendMessage(
      chatId,
      { text: `✅ Difusión terminada.\n📨 Enviados: ${enviados}\n❌ Fallidos: ${fallidos}` },
      { quoted: msg }
    );
  },
};
