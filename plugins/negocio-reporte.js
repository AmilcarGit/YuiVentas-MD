import { obtenerAjustes } from "../db/ajustesDB.js";
import { listarPedidos } from "../db/pedidosDB.js";

const RANGOS = {
  hoy: 24 * 60 * 60 * 1000,
  semana: 7 * 24 * 60 * 60 * 1000,
  mes: 30 * 24 * 60 * 60 * 1000,
};

function inicioDelDiaLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default {
  command: ["reporte", "reportes", "ventas"],
  category: "Negocio",
  description: "Muestra un reporte de ventas (hoy, semana o mes).",
  ownerOnly: true,
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const ajustes = obtenerAjustes();
    const rango = (args[0] || "hoy").toLowerCase();

    if (!["hoy", "semana", "mes"].includes(rango)) {
      await sock.sendMessage(
        chatId,
        { text: `❀ Uso: *${ajustes.prefix}reporte [hoy|semana|mes]*\nSi no pones nada, muestra el reporte de hoy.` },
        { quoted: msg }
      );
      return;
    }

    const desde = rango === "hoy" ? inicioDelDiaLocal() : Date.now() - RANGOS[rango];
    const todos = listarPedidos().filter((p) => p.creadoEn >= desde);

    const validos = todos.filter((p) => p.estado !== "cancelado");
    const cancelados = todos.filter((p) => p.estado === "cancelado");

    const totalVendido = validos.reduce((acc, p) => acc + p.total, 0);

    // Producto más vendido (por cantidad) en el rango
    const cantidadPorProducto = {};
    for (const pedido of validos) {
      for (const item of pedido.items) {
        cantidadPorProducto[item.nombre] = (cantidadPorProducto[item.nombre] || 0) + item.cantidad;
      }
    }
    const productosOrdenados = Object.entries(cantidadPorProducto).sort((a, b) => b[1] - a[1]);
    const topProductos = productosOrdenados.slice(0, 3);

    const etiquetaRango = { hoy: "HOY", semana: "ÚLTIMOS 7 DÍAS", mes: "ÚLTIMOS 30 DÍAS" }[rango];

    let texto = `📊 *REPORTE DE VENTAS — ${etiquetaRango}*\n`;
    texto += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;
    texto += `🧾 Pedidos: *${validos.length}*`;
    if (cancelados.length > 0) texto += ` _(+ ${cancelados.length} cancelado(s))_`;
    texto += `\n💰 Total vendido: *${ajustes.monedaSimbolo}${totalVendido.toFixed(2)}*\n`;

    if (validos.length > 0) {
      const promedio = totalVendido / validos.length;
      texto += `📈 Ticket promedio: *${ajustes.monedaSimbolo}${promedio.toFixed(2)}*\n`;
    }

    if (topProductos.length > 0) {
      texto += `\n🏆 *Más vendidos:*\n`;
      topProductos.forEach(([nombre, cantidad], i) => {
        texto += `${i + 1}. ${nombre} — ${cantidad} unidad(es)\n`;
      });
    } else {
      texto += `\n_Sin ventas en este período todavía._`;
    }

    texto += `\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
    texto += `Ver otro período: *${ajustes.prefix}reporte hoy* · *semana* · *mes*`;

    await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
  },
};
