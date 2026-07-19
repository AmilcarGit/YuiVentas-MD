import { obtenerAjustes } from "../db/ajustesDB.js";
import { crearCupon, eliminarCupon, listarCupones, obtenerCupon } from "../db/cuponesDB.js";

export default {
  command: ["addcupon", "delcupon", "vercupones"],
  category: "Negocio",
  description: "Crea, elimina o lista cupones de descuento.",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const comando = body.trim().split(/\s+/)[0].toLowerCase();
    const ajustes = obtenerAjustes();

    if (comando === "addcupon") {
      const contenido = body.trim().split(/\s+/).slice(1).join(" ");
      const [codigo, valor, usosMaxTexto] = contenido.split("|").map((p) => p.trim());

      if (!codigo || !valor || !/^\d+(\.\d+)?%?$/.test(valor)) {
        await sock.sendMessage(
          chatId,
          {
            text:
              `❀ Uso: *${ajustes.prefix}addcupon CODIGO | valor | usos_max(opcional)*\n\n` +
              `El valor puede ser un porcentaje o un monto fijo:\n` +
              `*${ajustes.prefix}addcupon VERANO20 | 20%*  → 20% de descuento\n` +
              `*${ajustes.prefix}addcupon 5SOLES | 5*  → ${ajustes.monedaSimbolo}5 de descuento\n\n` +
              `Usos máximos es opcional (déjalo vacío para ilimitado):\n` +
              `*${ajustes.prefix}addcupon VERANO20 | 20% | 50*`,
          },
          { quoted: msg }
        );
        return;
      }

      if (obtenerCupon(codigo)) {
        await sock.sendMessage(chatId, { text: `❌ Ya existe un cupón con el código *${codigo.toUpperCase()}*.` }, { quoted: msg });
        return;
      }

      const usosMax = usosMaxTexto ? parseInt(usosMaxTexto, 10) : null;
      const cupon = crearCupon(codigo, valor, Number.isNaN(usosMax) ? null : usosMax);

      await sock.sendMessage(
        chatId,
        {
          text:
            `✅ Cupón creado: *${cupon.codigo}*\n` +
            `🏷️ Descuento: ${cupon.valor.endsWith("%") ? cupon.valor : `${ajustes.monedaSimbolo}${cupon.valor}`}\n` +
            `🔢 Usos máximos: ${cupon.usosMax || "ilimitado"}\n\n` +
            `Tus clientes lo usan escribiendo: *${ajustes.prefix}cupon ${cupon.codigo}*`,
        },
        { quoted: msg }
      );
      return;
    }

    if (comando === "delcupon") {
      const codigo = (args[0] || "").trim();
      if (!codigo) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${ajustes.prefix}delcupon CODIGO*` }, { quoted: msg });
        return;
      }
      const ok = eliminarCupon(codigo);
      await sock.sendMessage(
        chatId,
        { text: ok ? `🗑️ Cupón *${codigo.toUpperCase()}* eliminado.` : "❌ No encontré ese cupón." },
        { quoted: msg }
      );
      return;
    }

    // vercupones
    const cupones = listarCupones();
    if (cupones.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: `📭 Todavía no tienes cupones creados.\nCrea uno con *${ajustes.prefix}addcupon CODIGO | valor*` },
        { quoted: msg }
      );
      return;
    }

    let texto = `🎟️ *CUPONES*\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;
    for (const c of cupones) {
      const descuento = c.valor.endsWith("%") ? c.valor : `${ajustes.monedaSimbolo}${c.valor}`;
      const usos = c.usosMax ? `${c.usosActuales}/${c.usosMax}` : `${c.usosActuales} (ilimitado)`;
      texto += `▸ *${c.codigo}* — ${descuento} — usos: ${usos}${c.activo ? "" : " _(inactivo)_"}\n`;
    }
    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
