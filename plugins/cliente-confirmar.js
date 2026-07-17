import { config } from "../config.js";
import { calcularResumen, vaciarCarrito } from "../db/carritoDB.js";
import { descontarStock } from "../db/productosDB.js";
import { crearPedido } from "../db/pedidosDB.js";
import { resolverNumeroReal } from "../middlewares.js";

export default {
  command: ["confirmar", "checkout", "pedir"],
  category: "Cliente",
  description: "Confirma tu pedido con lo que tienes en el carrito.",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const numero = await resolverNumeroReal(sock, sender, msg);
    const resumen = calcularResumen(numero);

    if (resumen.items.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: `🛒 Tu carrito está vacío. Agrega productos con *${config.prefix}agregar <ID> <cantidad>* antes de confirmar.` },
        { quoted: msg }
      );
      return;
    }

    // Verificar stock disponible antes de confirmar
    for (const item of resumen.items) {
      if (item.producto.stock !== null && item.cantidad > item.producto.stock) {
        await sock.sendMessage(
          chatId,
          { text: `⚠️ Ya no hay suficiente stock de *${item.producto.nombre}* (quedan ${item.producto.stock}). Ajusta tu carrito con *${config.prefix}quitar* o *${config.prefix}agregar*.` },
          { quoted: msg }
        );
        return;
      }
    }

    for (const item of resumen.items) {
      descontarStock(item.producto.id, item.cantidad);
    }

    let nombreCliente = numero;
    try {
      const contacto = sock.contacts?.[sender];
      nombreCliente = contacto?.name || contacto?.notify || numero;
    } catch (_) {}

    const pedido = crearPedido({
      numero,
      nombreCliente,
      items: resumen.items.map((i) => ({
        productoId: i.producto.id,
        nombre: i.producto.nombre,
        precio: i.producto.precio,
        cantidad: i.cantidad,
        subtotal: i.subtotal,
      })),
      total: resumen.total,
    });

    vaciarCarrito(numero);

    let textoCliente = `✅ *¡Pedido confirmado!*\n\n`;
    textoCliente += `🧾 N° de pedido: *${pedido.id}*\n`;
    for (const item of pedido.items) {
      textoCliente += `▸ ${item.cantidad}x ${item.nombre} — ${config.monedaSimbolo}${item.subtotal.toFixed(2)}\n`;
    }
    textoCliente += `\n💰 Total: *${config.monedaSimbolo}${pedido.total.toFixed(2)}*\n\n`;
    textoCliente += `En breve te contactamos para coordinar el pago y la entrega. ¡Gracias por tu compra! 🌸`;

    await sock.sendMessage(chatId, { text: textoCliente }, { quoted: msg });

    let textoOwner = `🔔 *NUEVO PEDIDO #${pedido.id}*\n\n`;
    textoOwner += `👤 Cliente: ${nombreCliente} (wa.me/${numero})\n\n`;
    for (const item of pedido.items) {
      textoOwner += `▸ ${item.cantidad}x ${item.nombre} — ${config.monedaSimbolo}${item.subtotal.toFixed(2)}\n`;
    }
    textoOwner += `\n💰 Total: *${config.monedaSimbolo}${pedido.total.toFixed(2)}*\n`;
    textoOwner += `\nEscribe *${config.prefix}pedidos* para ver todos los pedidos pendientes.`;

    for (const ownerNumero of config.ownerNumbers) {
      try {
        await sock.sendMessage(`${ownerNumero}@s.whatsapp.net`, { text: textoOwner });
      } catch (_) {}
    }
  },
};
