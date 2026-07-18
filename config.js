export const config = {
  // Identidad técnica del bot. El nombre del NEGOCIO (el que ven tus
  // clientes) se configura por WhatsApp con ".setnegocio", no aquí.
  botName: "YuiVentas-MD",
  creator: "AmilcarGit",

  sessionFolder: "./session",
  pluginsFolder: "./plugins",

  // Todo lo demás (dueños del bot, prefijo de comandos, símbolo de
  // moneda, velocidad de broadcast) se configura por WhatsApp una vez
  // conectado, y se guarda en database/ajustes.json.
  // El primer número que vincula el bot se vuelve dueño automáticamente.
};
