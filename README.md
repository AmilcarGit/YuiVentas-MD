# 🛍️ YuiVentas-MD

Bot de WhatsApp para **Marketing y Ventas**, construido sobre [Baileys](https://github.com/WhiskeySockets/Baileys).
Cada persona que lo instale con su propio número puede personalizarlo por completo **desde el mismo WhatsApp**, sin tocar código: nombre del negocio, catálogo de productos, mensajes de bienvenida, respuestas automáticas y envíos masivos.

> Base original: TheYui-MD por AmilcarGit — adaptado 100% a marketing/ventas.

---

## ✨ Qué incluye

- **Catálogo de productos** con fotos, precios, descripción y stock.
- **Carrito de compras** y confirmación de pedido por chat.
- **Notificación automática al dueño** cada vez que entra un pedido nuevo.
- **Envíos masivos (broadcast)** a listas de contactos, con pausa entre mensajes para reducir el riesgo de bloqueo.
- **Embudo de ventas**: mensaje de bienvenida automático al primer contacto + respuestas automáticas por palabra clave (FAQ).
- Todo administrable con comandos de WhatsApp, sin editar archivos.

---

## 📋 Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- Un número de WhatsApp para vincular como el bot (puede ser tu número o uno dedicado al negocio)

---

## 🚀 Instalación

```bash
git clone https://github.com/TU-USUARIO/YuiVentas-MD.git
cd YuiVentas-MD
npm install
npm start
```

Al iniciar por primera vez, elige vincular por **código de 8 dígitos** o **QR**, y sigue las instrucciones en consola (WhatsApp → Dispositivos vinculados).

---

## ⚙️ Configuración inicial

Antes de iniciar el bot, edita `config.js` y pon **tu número** como dueño (sin `+` ni espacios, con código de país):

```js
export const config = {
  ownerNumbers: ["51987654321"],
  prefix: ".",
  monedaSimbolo: "S/",
  ...
};
```

> ⚠️ **No subas la carpeta `database/` ni `session/` a un repositorio público**: ahí vive tu sesión de WhatsApp y los datos de tus clientes. El `.gitignore` ya las excluye.

El resto (nombre del negocio, bienvenida, datos de pago) se configura por WhatsApp una vez el bot está conectado, escribiéndote a ti mismo o desde otro número al bot:

```
.setnegocio Mi Tienda de Ropa
.setbienvenida ¡Hola! Bienvenido a Mi Tienda 🛍️ Escribe *catalogo* para ver los productos.
.setpago Yape: 987654321 (Juan Pérez)
```

---

## 📜 Comandos

### 🛒 Para clientes
| Comando | Descripción |
|---|---|
| `.catalogo` | Ver todos los productos |
| `.ver <ID>` | Ver detalle de un producto (con foto) |
| `.agregar <ID> <cantidad>` | Agregar producto al carrito |
| `.carrito` | Ver tu carrito |
| `.quitar <ID>` | Quitar un producto del carrito |
| `.vaciarcarrito` | Vaciar el carrito |
| `.confirmar` | Confirmar el pedido |

### ⚙️ Solo dueño del negocio
| Comando | Descripción |
|---|---|
| `.addproducto Nombre \| Precio \| Descripción \| Stock` | Agregar producto |
| `.editarproducto <ID> \| campo \| valor` | Editar producto (nombre, precio, descripcion, stock, activo) |
| `.eliminarproducto <ID>` | Eliminar producto |
| `.fotoproducto <ID>` | Asignar foto (respondiendo a una imagen) |
| `.pedidos` | Ver pedidos activos |
| `.pedidos <ID> <estado>` | Cambiar estado (pendiente, confirmado, enviado, entregado, cancelado) |
| `.broadcast [lista] <mensaje>` | Enviar mensaje masivo |
| `.addcontacto <numero> [lista]` | Agregar contacto a una lista |
| `.delcontacto <numero> [lista]` | Quitar contacto |
| `.importargrupo [lista]` | Importar miembros de un grupo a una lista |
| `.listas` | Ver todas las listas de contactos |
| `.setnegocio / .setbienvenida / .setpago` | Configurar el negocio |
| `.negocio` | Ver configuración actual |
| `.addfaq clave \| respuesta` | Agregar respuesta automática |
| `.delfaq clave` | Eliminar respuesta automática |
| `.verfaq` | Ver todas las respuestas automáticas |

---

## 🧩 Agregar un comando nuevo

Cada comando es un archivo `.js` en `plugins/`:

```js
export default {
  command: ["saludo", "hola"],
  category: "General",
  description: "Responde con un saludo",
  ownerOnly: false, // true = solo el dueño puede usarlo

  run: async (sock, msg, args, context) => {
    await sock.sendMessage(context.chatId, { text: "¡Hola! 👋" }, { quoted: msg });
  },
};
```

Se carga automáticamente al reiniciar el bot.

---

## 📤 Subir tu copia a GitHub (gratis)

```bash
cd YuiVentas-MD
git init
git add .
git commit -m "Mi bot de ventas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Crea el repositorio vacío en GitHub primero (botón "New repository"), y usa esa URL en `git remote add origin`.

---

## 📄 Licencia

MIT
