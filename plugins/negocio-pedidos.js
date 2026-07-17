import { config } from "../config.js";
import { listarPedidos, obtenerPedido, actualizarEstadoPedido } from "../db/pedidosDB.js";

const ESTADOS_VALIDOS = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

export default {
  command: ["pedidos", "orders"],
  category: "Negocio",
  description: "Ver pedidos o actualizar su estado. Uso: pedidos  ·  pedidos <ID> <estado>",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId } = context;

    // pedidos <ID> <estado>  -> actualizar estado
    if (args.length >= 2) {
      const id = args[0];
      const estado = args[1].toLowerCase();

      if (!ESTADOS_VALIDOS.includes(estado)) {
        await sock.sendMessage(
          chatId,
          { text: `❀ Estados válidos: ${ESTADOS_VALIDOS.join(", ")}` },
          { quoted: msg }
        );
        return;
      }

      const pedido = actualizarEstadoPedido(id, estado);
      if (!pedido) {
        await sock.sendMessage(chatId, { text: "❌ No encontré ese pedido." }, { quoted: msg });
        return;
      }

      await sock.sendMessage(chatId, { text: `✅ Pedido #${id} actualizado a *${estado}*.` }, { quoted: msg });

      try {
        await sock.sendMessage(`${pedido.numero}@s.whatsapp.net`, {
          text: `📦 Tu pedido *#${id}* cambió de estado a: *${estado}*`,
        });
      } catch (_) {}

      return;
    }

    // pedidos -> listar pendientes/confirmados
    const pedidos = listarPedidos().filter((p) => p.estado !== "entregado" && p.estado !== "cancelado");

    if (pedidos.length === 0) {
      await sock.sendMessage(chatId, { text: "📭 No hay pedidos activos por ahora." }, { quoted: msg });
      return;
    }

    let texto = `📦 *PEDIDOS ACTIVOS* (${pedidos.length})\n━━━━━━━━━━━━━━━━━━\n\n`;
    for (const p of pedidos) {
      texto += `🧾 #${p.id} — ${p.nombreCliente} — ${config.monedaSimbolo}${p.total.toFixed(2)} — _${p.estado}_\n`;
    }
    texto += `\n✏️ Cambiar estado: *${config.prefix}pedidos <ID> <estado>*\n`;
    texto += `Estados: ${ESTADOS_VALIDOS.join(", ")}`;

    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
