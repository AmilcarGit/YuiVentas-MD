export const config = {
  // Identidad del bot / negocio (esto también se puede cambiar por WhatsApp
  // con el comando ".setnegocio", pero estos son los valores iniciales)
  botName: "YuiVentas-MD",
  creator: "AmilcarGit",

  // Números del DUEÑO del bot, sin "+" ni espacios, con código de país.
  // Ejemplo: "51987654321". Pon aquí TU número al instalarlo.
  ownerNumbers: ["51910227479"],

  sessionFolder: "./session",
  pluginsFolder: "./plugins",

  // Prefijo de los comandos. Puedes cambiarlo por "!", "/", "#", etc.
  prefix: ".",

  // Moneda usada al mostrar precios (solo texto, no hace conversión real)
  monedaSimbolo: "S/",

  // Cada cuántos milisegundos esperar entre mensajes de un broadcast,
  // para reducir el riesgo de que WhatsApp banee el número por spam.
  broadcastDelayMs: 3000,
};
