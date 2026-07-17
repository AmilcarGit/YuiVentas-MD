import { config } from "../config.js";
import { obtenerProducto, editarProducto, eliminarProducto } from "../db/productosDB.js";

export default {
  command: ["editarproducto", "eliminarproducto", "delproducto"],
  category: "Negocio",
  description: "Edita o elimina un producto. Uso: editarproducto <ID> | campo | valor  ·  eliminarproducto <ID>",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const comando = body.trim().split(/\s+/)[0].toLowerCase();

    if (comando === "eliminarproducto" || comando === "delproducto") {
      const id = (args[0] || "").toLowerCase();
      if (!id) {
        await sock.sendMessage(chatId, { text: `❀ Uso: *${config.prefix}eliminarproducto <ID>*` }, { quoted: msg });
        return;
      }
      const ok = eliminarProducto(id);
      await sock.sendMessage(
        chatId,
        { text: ok ? `🗑️ Producto \`${id}\` eliminado.` : "❌ No encontré ese producto." },
        { quoted: msg }
      );
      return;
    }

    // editarproducto <ID> | campo | valor
    const contenido = body.trim().split(/\s+/).slice(1).join(" ");
    const partes = contenido.split("|").map((p) => p.trim());
    const [id, campo, ...valorPartes] = partes;
    const valor = valorPartes.join("|").trim();

    const camposValidos = ["nombre", "precio", "descripcion", "stock", "activo"];

    if (!id || !campo || !camposValidos.includes(campo.toLowerCase())) {
      await sock.sendMessage(
        chatId,
        {
          text:
            `❀ Uso: *${config.prefix}editarproducto <ID> | campo | valor*\n\n` +
            `Campos válidos: ${camposValidos.join(", ")}\n\n` +
            `Ejemplos:\n` +
            `*${config.prefix}editarproducto playera-azul | precio | 50*\n` +
            `*${config.prefix}editarproducto playera-azul | activo | no*  (la oculta del catálogo)`,
        },
        { quoted: msg }
      );
      return;
    }

    const producto = obtenerProducto(id.toLowerCase());
    if (!producto) {
      await sock.sendMessage(chatId, { text: "❌ No encontré ese producto." }, { quoted: msg });
      return;
    }

    const campoLower = campo.toLowerCase();
    let cambios = {};

    if (campoLower === "precio") {
      const precio = parseFloat(valor.replace(",", "."));
      if (isNaN(precio)) {
        await sock.sendMessage(chatId, { text: "❌ Precio inválido." }, { quoted: msg });
        return;
      }
      cambios.precio = precio;
    } else if (campoLower === "stock") {
      const stock = valor.toLowerCase() === "ilimitado" ? null : parseInt(valor, 10);
      cambios.stock = Number.isNaN(stock) ? null : stock;
    } else if (campoLower === "activo") {
      cambios.activo = !["no", "false", "0", "off"].includes(valor.toLowerCase());
    } else {
      cambios[campoLower] = valor;
    }

    editarProducto(producto.id, cambios);
    await sock.sendMessage(chatId, { text: `✅ Producto \`${producto.id}\` actualizado.` }, { quoted: msg });
  },
};
