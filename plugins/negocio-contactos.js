import { config } from "../config.js";
import { agregarContacto, agregarContactosMasivo, quitarContacto, obtenerLista, listarListas } from "../db/contactosDB.js";

export default {
  command: ["addcontacto", "delcontacto", "listas", "importargrupo"],
  category: "Negocio",
  description: "Administra tus listas de contactos para envíos masivos.",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const comando = body.trim().split(/\s+/)[0].toLowerCase();

    if (comando === "addcontacto") {
      const numero = (args[0] || "").replace(/\D/g, "");
      const lista = (args[1] || "general").toLowerCase();

      if (!numero) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${config.prefix}addcontacto <numero> [lista]*` }, { quoted: msg });
        return;
      }

      const agregado = agregarContacto(numero, lista);
      await sock.sendMessage(
        chatId,
        { text: agregado ? `✅ ${numero} agregado a la lista *${lista}*.` : `ℹ️ ${numero} ya estaba en la lista *${lista}*.` },
        { quoted: msg }
      );
      return;
    }

    if (comando === "delcontacto") {
      const numero = (args[0] || "").replace(/\D/g, "");
      const lista = (args[1] || "general").toLowerCase();

      const quitado = quitarContacto(numero, lista);
      await sock.sendMessage(
        chatId,
        { text: quitado ? `🗑️ ${numero} quitado de la lista *${lista}*.` : "❌ No encontré ese número en la lista." },
        { quoted: msg }
      );
      return;
    }

    if (comando === "importargrupo") {
      const lista = (args[0] || "general").toLowerCase();

      if (!chatId.endsWith("@g.us")) {
        await sock.sendMessage(chatId, { text: "❀ Este comando solo funciona dentro de un grupo." }, { quoted: msg });
        return;
      }

      try {
        const metadata = await sock.groupMetadata(chatId);
        const numeros = metadata.participants
          .map((p) => String(p.id).split("@")[0].split(":")[0])
          .filter((n) => /^\d+$/.test(n));

        const agregados = agregarContactosMasivo(numeros, lista);
        await sock.sendMessage(
          chatId,
          { text: `✅ Importados ${agregados} contacto(s) nuevo(s) a la lista *${lista}* (de ${numeros.length} miembros del grupo).` },
          { quoted: msg }
        );
      } catch (err) {
        await sock.sendMessage(chatId, { text: "❌ No pude leer los miembros del grupo." }, { quoted: msg });
      }
      return;
    }

    // "listas" -> mostrar todas las listas y su tamaño
    const nombres = listarListas();
    let texto = `📋 *LISTAS DE CONTACTOS*\n━━━━━━━━━━━━━━━━━━\n\n`;
    for (const nombre of nombres) {
      texto += `▸ *${nombre}*: ${obtenerLista(nombre).length} contacto(s)\n`;
    }
    texto += `\n➕ Agregar: *${config.prefix}addcontacto <numero> [lista]*\n`;
    texto += `➖ Quitar: *${config.prefix}delcontacto <numero> [lista]*\n`;
    texto += `📥 Importar miembros de un grupo: *${config.prefix}importargrupo [lista]*`;

    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
