import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

import fs from "fs";
import path from "path";
import { obtenerAjustes } from "../db/ajustesDB.js";
import { obtenerProducto, establecerImagen } from "../db/productosDB.js";

export default {
  command: ["fotoproducto", "productofoto"],
  category: "Negocio",
  description: "Asigna una foto a un producto. Responde a una imagen con: fotoproducto <ID>",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const ajustes = obtenerAjustes();
    const id = (args[0] || "").toLowerCase();

    if (!id) {
      await sock.sendMessage(chatId, { text: `❀ Uso: responde a una imagen con *${ajustes.prefix}fotoproducto <ID>*` }, { quoted: msg });
      return;
    }

    const producto = obtenerProducto(id);
    if (!producto) {
      await sock.sendMessage(chatId, { text: "❌ No encontré ese producto." }, { quoted: msg });
      return;
    }

    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mensajeImagen = citado?.imageMessage || msg.message?.imageMessage;

    if (!mensajeImagen) {
      await sock.sendMessage(
        chatId,
        { text: "❀ Debes *responder a una imagen* con este comando, o enviar la imagen con el comando en el texto." },
        { quoted: msg }
      );
      return;
    }

    try {
      const buffer = await downloadMediaMessage(
        { message: { imageMessage: mensajeImagen } },
        "buffer",
        {}
      );

      const dir = path.join("./database/imagenes");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const ruta = path.join(dir, `${producto.id}.jpg`);
      fs.writeFileSync(ruta, buffer);

      establecerImagen(producto.id, ruta);

      await sock.sendMessage(chatId, { text: `✅ Foto guardada para *${producto.nombre}*.` }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(chatId, { text: "❌ No pude descargar la imagen, intenta de nuevo." }, { quoted: msg });
    }
  },
};
