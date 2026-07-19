import { obtenerAjustes } from "../db/ajustesDB.js";
import { calcularResumen, vaciarCarrito } from "../db/carritoDB.js";
import { descontarStock } from "../db/productosDB.js";
import { crearPedido } from "../db/pedidosDB.js";
import { resolverNumeroReal } from "../middlewares.js";
import {
  obtenerCuponDeCliente,
  obtenerCupon,
  cuponValido,
  calcularDescuento,
  registrarUso,
  quitarCuponDeCliente,
} from "../db/cuponesDB.js";

export default {
  command: ["confirmar", "checkout", "pedir"],
  category: "Cliente",
  description: "Confirma tu pedido con lo que tienes en el carrito.",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const ajustes = obtenerAjustes();
    const numero = await resolverNumeroReal(sock, sender, msg);
    const resumen = calcularResumen(numero);

    if (resumen.items.length === 0) {
      await sock.sendMessage(
        chatId,
        { text: `🛒 Tu carrito está vacío. Agrega productos con *${ajustes.prefix}agregar <ID> <cantidad>* antes de confirmar.` },
        { quoted: msg }
      );
      return;
    }

    // Verificar stock disponible antes de confirmar
    for (const item of resumen.items) {
      if (item.producto.stock !== null && item.cantidad > item.producto.stock) {
        await sock.sendMessage(
          chatId,
          { text: `⚠️ Ya no hay suficiente stock de *${item.producto.nombre}* (quedan ${item.producto.stock}). Ajusta tu carrito con *${ajustes.prefix}quitar* o *${ajustes.prefix}agregar*.` },
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

    // Si el cliente tiene un cupón guardado (con "cupon <código>"), se
    // aplica aquí. Si ya no es válido (se agotó, lo desactivaron, etc.)
    // simplemente se ignora y se le avisa, sin bloquear la compra.
    let cuponUsado = null;
    let descuento = 0;
    let avisoCupon = "";

    const codigoGuardado = obtenerCuponDeCliente(numero);
    if (codigoGuardado) {
      const cupon = obtenerCupon(codigoGuardado);
      if (cupon && cuponValido(cupon)) {
        descuento = calcularDescuento(cupon, resumen.total);
        cuponUsado = cupon.codigo;
        registrarUso(cupon.codigo);
      } else {
        avisoCupon = `\n⚠️ Tu cupón *${codigoGuardado}* ya no estaba disponible, así que no se aplicó.`;
      }
      quitarCuponDeCliente(numero);
    }

    const totalFinal = resumen.total - descuento;

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
      subtotal: resumen.total,
      cupon: cuponUsado,
      descuento,
      total: totalFinal,
    });

    vaciarCarrito(numero);

    let textoCliente = `✅ *¡Pedido confirmado!*\n\n`;
    textoCliente += `🧾 N° de pedido: *${pedido.id}*\n`;
    for (const item of pedido.items) {
      textoCliente += `▸ ${item.cantidad}x ${item.nombre} — ${ajustes.monedaSimbolo}${item.subtotal.toFixed(2)}\n`;
    }
    if (cuponUsado) {
      textoCliente += `\nSubtotal: ${ajustes.monedaSimbolo}${pedido.subtotal.toFixed(2)}\n`;
      textoCliente += `Cupón *${cuponUsado}*: -${ajustes.monedaSimbolo}${descuento.toFixed(2)}\n`;
    }
    textoCliente += `\n💰 Total: *${ajustes.monedaSimbolo}${pedido.total.toFixed(2)}*${avisoCupon}\n\n`;
    textoCliente += `En breve te contactamos para coordinar el pago y la entrega. ¡Gracias por tu compra! 🌸`;

    await sock.sendMessage(chatId, { text: textoCliente }, { quoted: msg });

    let textoOwner = `🔔 *NUEVO PEDIDO #${pedido.id}*\n\n`;
    textoOwner += `👤 Cliente: ${nombreCliente} (wa.me/${numero})\n\n`;
    for (const item of pedido.items) {
      textoOwner += `▸ ${item.cantidad}x ${item.nombre} — ${ajustes.monedaSimbolo}${item.subtotal.toFixed(2)}\n`;
    }
    if (cuponUsado) {
      textoOwner += `\nSubtotal: ${ajustes.monedaSimbolo}${pedido.subtotal.toFixed(2)}\n`;
      textoOwner += `Cupón *${cuponUsado}*: -${ajustes.monedaSimbolo}${descuento.toFixed(2)}\n`;
    }
    textoOwner += `\n💰 Total: *${ajustes.monedaSimbolo}${pedido.total.toFixed(2)}*\n`;
    textoOwner += `\nEscribe *${ajustes.prefix}pedidos* para ver todos los pedidos pendientes.`;

    for (const ownerNumero of ajustes.owners) {
      try {
        await sock.sendMessage(`${ownerNumero}@s.whatsapp.net`, { text: textoOwner });
      } catch (_) {}
    }
  },
};
