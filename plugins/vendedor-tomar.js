import { obtenerAjustes } from "../db/ajustesDB.js";
import { obtenerPedido, tomarPedido, liberarPedido } from "../db/pedidosDB.js";
import { resolverNumeroReal } from "../middlewares.js";

async function avisarAlEquipo(sock, ajustes, texto, exceptoNumero) {
  const equipo = [...ajustes.owners, ...(ajustes.vendedores || [])];
  for (const numero of equipo) {
    if (numero === exceptoNumero) continue;
    try {
      await sock.sendMessage(`${numero}@s.whatsapp.net`, { text });
    } catch (_) {}
  }
}

export default {
  command: ["tomar", "liberar"],
  category: "Negocio",
  description: "Tomar o soltar un pedido, para que solo una persona del equipo lo atienda a la vez.",
  vendedorOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, sender, body } = context;
    const comando = body.trim().split(/\s+/)[0].toLowerCase();
    const ajustes = obtenerAjustes();
    const id = (args[0] || "").trim();

    if (!id) {
      await sock.sendMessage(chatId, { text: `❀ Uso: *${ajustes.prefix}${comando} <ID de pedido>*` }, { quoted: msg });
      return;
    }

    const pedido = obtenerPedido(id);
    if (!pedido) {
      await sock.sendMessage(chatId, { text: "❌ No encontré ese pedido." }, { quoted: msg });
      return;
    }

    const numero = await resolverNumeroReal(sock, sender, msg);

    if (comando === "liberar") {
      if (!pedido.atendidoPor) {
        await sock.sendMessage(chatId, { text: `ℹ️ El pedido #${id} no estaba siendo atendido por nadie.` }, { quoted: msg });
        return;
      }
      liberarPedido(id);
      await sock.sendMessage(chatId, { text: `🔓 Soltaste el pedido #${id}. Ya lo puede tomar otra persona del equipo.` }, { quoted: msg });
      await avisarAlEquipo(sock, ajustes, `🔓 El pedido *#${id}* quedó libre de nuevo.`, numero);
      return;
    }

    // tomar
    let nombre = numero;
    try {
      const contacto = sock.contacts?.[sender];
      nombre = contacto?.name || contacto?.notify || numero;
    } catch (_) {}

    const resultado = tomarPedido(id, numero, nombre);

    if (!resultado.ok && resultado.motivo === "ya_tomado") {
      await sock.sendMessage(
        chatId,
        { text: `🙋 El pedido #${id} ya lo está atendiendo *${resultado.pedido.atendidoPor.nombre}*.` },
        { quoted: msg }
      );
      return;
    }

    await sock.sendMessage(
      chatId,
      {
        text:
          `✋ Tomaste el pedido *#${id}*.\n\n` +
          `👤 Cliente: ${pedido.nombreCliente} (wa.me/${pedido.numero})\n` +
          `💰 Total: ${ajustes.monedaSimbolo}${pedido.total.toFixed(2)}\n\n` +
          `Cuando termines, escribe *${ajustes.prefix}liberar ${id}* o actualiza el estado con *${ajustes.prefix}pedidos ${id} <estado>*.`,
      },
      { quoted: msg }
    );

    await avisarAlEquipo(sock, ajustes, `✋ *${nombre}* tomó el pedido *#${id}*. No hace falta que nadie más lo atienda.`, numero);
  },
};
