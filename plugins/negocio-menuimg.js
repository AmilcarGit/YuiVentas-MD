import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

import fs from "fs";
import path from "path";
import { obtenerAjustes } from "../db/ajustesDB.js";
import { actualizarNegocio } from "../db/negocioDB.js";

export default {
  command: ["setmenuimg", "resetmenuimg"],
  category: "Negocio",
  description: "Asigna o quita la imagen personalizada del menú. Responde a una imagen con: setmenuimg",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const ajustes = obtenerAjustes();
    const comando = body.trim().split(/\s+/)[0].toLowerCase();

    if (comando === "resetmenuimg") {
      actualizarNegocio({ menuImagen: "" });
      await sock.sendMessage(chatId, { text: "✅ Vuelto a la imagen de menú por defecto." }, { quoted: msg });
      return;
    }

    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mensajeImagen = citado?.imageMessage || msg.message?.imageMessage;

    if (!mensajeImagen) {
      await sock.sendMessage(
        chatId,
        { text: `❀ Debes *responder a una imagen* con *${ajustes.prefix}setmenuimg*, o enviar la imagen con el comando en el texto.` },
        { quoted: msg }
      );
      return;
    }

    try {
      const buffer = await downloadMediaMessage({ message: { imageMessage: mensajeImagen } }, "buffer", {});

      const dir = path.join("./database/imagenes");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const ruta = path.join(dir, "menu.jpg");
      fs.writeFileSync(ruta, buffer);

      actualizarNegocio({ menuImagen: ruta });

      await sock.sendMessage(chatId, { text: "✅ Imagen del menú actualizada. Escribe *menu* para verla." }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(chatId, { text: "❌ No pude descargar la imagen, intenta de nuevo." }, { quoted: msg });
    }
  },
};
