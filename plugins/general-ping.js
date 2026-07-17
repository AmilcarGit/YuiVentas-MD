export default {
  command: ["ping"],
  category: "General",
  description: "Muestra la velocidad de respuesta del bot.",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const inicio = Date.now();
    const enviado = await sock.sendMessage(chatId, { text: "🏓 Calculando..." }, { quoted: msg });
    const ms = Date.now() - inicio;
    await sock.sendMessage(chatId, { text: `🏓 Pong! *${ms}ms*` }, { quoted: msg });
  },
};
