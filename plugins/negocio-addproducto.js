import { obtenerAjustes } from "../db/ajustesDB.js";
import { crearProducto } from "../db/productosDB.js";

export default {
  command: ["addproducto", "nuevoproducto"],
  category: "Negocio",
  description: "Agrega un producto al catálogo. Uso: addproducto Nombre | Precio | Descripción | Stock(opcional)",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const ajustes = obtenerAjustes();
    const contenido = body.trim().split(/\s+/).slice(1).join(" ");
    const partes = contenido.split("|").map((p) => p.trim());
    const [nombre, precioTexto, descripcion, stockTexto] = partes;

    if (!nombre || !precioTexto) {
      await sock.sendMessage(
        chatId,
        {
          text:
            `❀ Uso:\n*${ajustes.prefix}addproducto Nombre | Precio | Descripción | Stock*\n\n` +
            `El Stock es opcional (déjalo vacío para stock ilimitado).\n\n` +
            `Ejemplo:\n*${ajustes.prefix}addproducto Playera azul | 45.00 | Talla M-L, 100% algodón | 10*`,
        },
        { quoted: msg }
      );
      return;
    }

    const precio = parseFloat(precioTexto.replace(",", "."));
    if (isNaN(precio) || precio < 0) {
      await sock.sendMessage(chatId, { text: "❌ El precio no es válido. Usa solo números, ej: 45.00" }, { quoted: msg });
      return;
    }

    const stock = stockTexto ? parseInt(stockTexto, 10) : null;

    const producto = crearProducto({
      nombre,
      precio,
      descripcion: descripcion || "",
      stock: Number.isNaN(stock) ? null : stock,
    });

    await sock.sendMessage(
      chatId,
      {
        text:
          `✅ Producto agregado al catálogo.\n\n` +
          `🔹 *${producto.nombre}*\n` +
          `💵 ${ajustes.monedaSimbolo}${producto.precio.toFixed(2)}\n` +
          `🔑 ID: \`${producto.id}\`\n\n` +
          `📸 Para ponerle foto, responde a una imagen con:\n*${ajustes.prefix}fotoproducto ${producto.id}*`,
      },
      { quoted: msg }
    );
  },
};
