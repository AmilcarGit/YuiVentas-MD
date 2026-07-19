import { obtenerAjustes, agregarVendedor, quitarVendedor } from "../db/ajustesDB.js";

export default {
  command: ["addvendedor", "delvendedor", "vervendedores"],
  category: "Negocio",
  description: "Da o quita acceso al equipo de ventas (atender pedidos, sin permisos de administración total).",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId, body } = context;
    const comando = body.trim().split(/\s+/)[0].toLowerCase();
    const ajustes = obtenerAjustes();

    if (comando === "addvendedor") {
      const numero = (args[0] || "").replace(/\D/g, "");
      if (!numero) {
        await sock.sendMessage(
          chatId,
          { text: `❀ Uso: *${ajustes.prefix}addvendedor <numero>*\nEjemplo: *${ajustes.prefix}addvendedor 51987654321*` },
          { quoted: msg }
        );
        return;
      }

      const agregado = agregarVendedor(numero);
      await sock.sendMessage(
        chatId,
        {
          text: agregado
            ? `✅ ${numero} ahora es parte del equipo de ventas. Puede usar *pedidos*, *tomar* y *liberar*.`
            : `ℹ️ ${numero} ya era vendedor.`,
        },
        { quoted: msg }
      );

      if (agregado) {
        sock.sendMessage(`${numero}@s.whatsapp.net`, {
          text: `🧑‍💼 Fuiste agregado al equipo de ventas del negocio.\nEscribe *pedidos* para ver los pedidos activos, o *tomar <ID>* para atender uno.`,
        }).catch(() => {});
      }
      return;
    }

    if (comando === "delvendedor") {
      const numero = (args[0] || "").replace(/\D/g, "");
      const quitado = quitarVendedor(numero);
      await sock.sendMessage(
        chatId,
        { text: quitado ? `🗑️ ${numero} ya no es parte del equipo de ventas.` : "❌ Ese número no estaba en el equipo." },
        { quoted: msg }
      );
      return;
    }

    // vervendedores
    const lista = ajustes.vendedores || [];
    if (lista.length === 0) {
      await sock.sendMessage(chatId, { text: "📭 Todavía no tienes vendedores agregados." }, { quoted: msg });
      return;
    }
    await sock.sendMessage(
      chatId,
      { text: `🧑‍💼 *EQUIPO DE VENTAS*\n\n${lista.map((n) => `▸ ${n}`).join("\n")}` },
      { quoted: msg }
    );
  },
};
