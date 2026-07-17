import { vaciarCarrito } from "../db/carritoDB.js";
import { resolverNumeroReal } from "../middlewares.js";

export default {
  command: ["vaciarcarrito", "clearcart"],
  category: "Cliente",
  description: "Vacía por completo tu carrito.",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const numero = await resolverNumeroReal(sock, sender, msg);
    vaciarCarrito(numero);
    await sock.sendMessage(chatId, { text: "🧹 Tu carrito quedó vacío." }, { quoted: msg });
  },
};
