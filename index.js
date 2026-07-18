import { createRequire } from "module";
const require = createRequire(import.meta.url);
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
} = require("@whiskeysockets/baileys");
import { Boom } from "@hapi/boom";
import readline from "readline";
import pino from "pino";
import chalk from "chalk";
import fs from "fs";

import { config } from "./config.js";
import { loadPlugins } from "./pluginLoader.js";
import { pasaFiltros, resolverNumeroReal } from "./middlewares.js";
import { obtenerNegocio, yaSaludoA, marcarSaludado } from "./db/negocioDB.js";
import { obtenerAjustes, asegurarPrimerOwner } from "./db/ajustesDB.js";
import { buscarRespuesta } from "./db/faqDB.js";
import { iniciarLimpiezaAutomatica } from "./limpieza.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

process.on("uncaughtException", (err) => {
  console.log(chalk.red("❌ Error no controlado (uncaughtException):"), err);
});
process.on("unhandledRejection", (err) => {
  console.log(chalk.red("❌ Promesa rechazada sin manejar (unhandledRejection):"), err);
});

let plugins = [];
const groupMetadataCache = new Map();

async function enviarConReintento(sock, chatId, content, opciones = {}, intentos = 2) {
  for (let i = 0; i <= intentos; i++) {
    try {
      return await sock.sendMessage(chatId, content, opciones);
    } catch (err) {
      if (i === intentos) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function startBot() {
  const negocio = obtenerNegocio();

  console.log(
    chalk.magentaBright(`
🛍️━━━━━━━━━━━━━━━━━━━━━━━━━━━🛍️
   ${config.botName.toUpperCase()}
   Bot de Marketing y Ventas
   Negocio: ${negocio.nombre}
🛍️━━━━━━━━━━━━━━━━━━━━━━━━━━━🛍️
`)
  );

  plugins = await loadPlugins();

  iniciarLimpiezaAutomatica(30 * 60 * 1000, ({ archivosEliminados }) => {
    if (archivosEliminados > 0) {
      console.log(chalk.magenta(`🧹 Limpieza automática: ${archivosEliminados} archivo(s) temporal(es) eliminado(s).`));
    }
  });

  const { state, saveCreds } = await useMultiFileAuthState(config.sessionFolder);
  const { version } = await fetchLatestBaileysVersion();
  const usePairingCode = !fs.existsSync(`${config.sessionFolder}/creds.json`);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: !usePairingCode,
    browser: Browsers.ubuntu("Chrome"),
    logger: pino({ level: "silent" }),
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 90000,
    keepAliveIntervalMs: 25000,
    cachedGroupMetadata: async (jid) => groupMetadataCache.get(jid),
  });

  sock.ev.on("groups.update", async ([event]) => {
    if (!event?.id) return;
    try {
      groupMetadataCache.set(event.id, await sock.groupMetadata(event.id));
    } catch (_) {}
  });

  sock.contacts = {};
  sock.ev.on("contacts.upsert", (contactos) => {
    for (const c of contactos) sock.contacts[c.id] = c;
  });
  sock.ev.on("contacts.update", (actualizaciones) => {
    for (const act of actualizaciones) {
      if (sock.contacts[act.id]) Object.assign(sock.contacts[act.id], act);
      else sock.contacts[act.id] = act;
    }
  });

  if (usePairingCode) {
    const metodo = await question(
      chalk.yellow("\n¿Cómo quieres vincular el bot?\n1) Código de 8 dígitos\n2) Código QR\nElige 1 o 2: ")
    );

    if (metodo.trim() === "1") {
      const numero = await question(
        chalk.yellow("\nEscribe tu número de WhatsApp con código de país (sin + ni espacios). Ej: 51910227479\nNúmero: ")
      );

      const pedirCodigoConReintentos = async (intentosRestantes = 4) => {
        try {
          const code = await sock.requestPairingCode(numero.trim());
          console.log(chalk.greenBright(`\n✅ Tu código de vinculación es: `) + chalk.bold.white(code));
          console.log(chalk.gray("Ve a WhatsApp > Dispositivos vinculados > Vincular con número de teléfono.\n"));
        } catch (err) {
          if (intentosRestantes > 0) {
            console.log(chalk.yellow(`⚠️  Reintentando en 4s... (${intentosRestantes} intento(s) restante(s))`));
            await new Promise((r) => setTimeout(r, 4000));
            return pedirCodigoConReintentos(intentosRestantes - 1);
          }
          console.log(chalk.red("❌ Error solicitando el código de vinculación:"), err);
        }
      };

      setTimeout(() => pedirCodigoConReintentos(), 2000);
    } else {
      console.log(chalk.yellow("\nEscanea el código QR que aparecerá arriba con WhatsApp > Dispositivos vinculados.\n"));
    }
  }

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(
        chalk.red(
          `⚠️  Conexión cerrada. ${shouldReconnect ? "Reconectando..." : "Sesión cerrada, borra la carpeta 'session' para reiniciar."}`
        )
      );

      if (shouldReconnect) {
        startBot().catch((err) => {
          console.log(chalk.red("❌ Error al reconectar, reintentando en 5s:"), err);
          setTimeout(() => startBot().catch(() => {}), 5000);
        });
      }
    } else if (connection === "open") {
      console.log(chalk.greenBright(`\n✅ ${config.botName} conectado y listo para vender 🛍️\n`));

      // El número con el que se vinculó el bot se vuelve dueño automáticamente
      // si todavía no hay ningún dueño registrado (primera vez que se instala).
      const numeroBot = String(sock.user?.id || "").split("@")[0].split(":")[0].replace(/\D/g, "");
      if (numeroBot && asegurarPrimerOwner(numeroBot)) {
        console.log(chalk.greenBright(`👑 ${numeroBot} registrado como dueño del bot automáticamente.`));
        sock.sendMessage(`${numeroBot}@s.whatsapp.net`, {
          text:
            `👑 *¡Listo!* Este número (${numeroBot}) quedó registrado como dueño de *${config.botName}*.\n\n` +
            `Escribe *.menu* para ver todos los comandos, o *.ajustes* para configurar prefijo, moneda y otros dueños.`,
        }).catch(() => {});
      }

      (async () => {
        try {
          const todosLosGrupos = await sock.groupFetchAllParticipating();
          for (const chatId of Object.keys(todosLosGrupos)) {
            groupMetadataCache.set(chatId, todosLosGrupos[chatId]);
          }
        } catch (_) {}
      })();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      "";

    if (!body) return;

    const numeroLimpio = sender.split("@")[0];
    console.log(chalk.blueBright(`📩 ${numeroLimpio}: `) + body);

    const esGrupo = chatId.endsWith("@g.us");
    const texto = body.trim();

    // --- Embudo de ventas: mensaje de bienvenida automático en el primer
    // contacto privado con el bot ---
    if (!esGrupo) {
      const numeroReal = await resolverNumeroReal(sock, sender, msg);
      if (!yaSaludoA(numeroReal)) {
        marcarSaludado(numeroReal);
        const negocio = obtenerNegocio();
        await enviarConReintento(sock, chatId, { text: negocio.bienvenida });
      }
    }

    // --- Enrutador de comandos (con prefijo configurable por WhatsApp) ---
    const { prefix } = obtenerAjustes();

    if (texto.startsWith(prefix)) {
      const sinPrefijo = texto.slice(prefix.length).trim();
      const primeraPalabra = sinPrefijo.split(/\s+/)[0]?.toLowerCase();
      const args = sinPrefijo.split(/\s+/).slice(1);
      const context = { sender, chatId, body: sinPrefijo, allPlugins: plugins };

      for (const plugin of plugins) {
        if (plugin.command.includes(primeraPalabra)) {
          try {
            const puedeContinuar = await pasaFiltros(sock, msg, plugin, context);
            if (!puedeContinuar) break;
            await plugin.run(sock, msg, args, context);
          } catch (err) {
            console.log(chalk.red(`❌ Error ejecutando el plugin ${plugin.fileName}:`), err);
          }
          break;
        }
      }
      return;
    }

    // --- Sin prefijo: respuestas automáticas por palabra clave (FAQ) ---
    const respuestaFAQ = buscarRespuesta(texto);
    if (respuestaFAQ) {
      await enviarConReintento(sock, chatId, { text: respuestaFAQ });
    }
  });
}

startBot().catch((err) => {
  console.log(chalk.red("❌ Error al iniciar el bot:"), err);
});
