<div align="center">

# 🛍️ YuiVentas-MD

**Bot de WhatsApp para Marketing y Ventas**, construido sobre [Baileys](https://github.com/WhiskeySockets/Baileys) (WhatsApp Multi-Device).

Catálogo · Carrito · Pedidos · Envíos masivos · Respuestas automáticas — todo administrable **desde el propio WhatsApp**, sin tocar una sola línea de código.

</div>

---

## Índice

- [¿Qué es esto?](#qué-es-esto)
- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Primera configuración](#primera-configuración)
- [Cómo administrarlo](#cómo-administrarlo)
- [Referencia de comandos](#referencia-de-comandos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Crear un comando nuevo](#crear-un-comando-nuevo)
- [Notas de seguridad y privacidad](#notas-de-seguridad-y-privacidad)
- [Solución de problemas](#solución-de-problemas)
- [Licencia](#licencia)

---

## ¿Qué es esto?

**YuiVentas-MD** convierte cualquier número de WhatsApp en un vendedor automático: muestra un catálogo, arma carritos, recibe pedidos, avisa al dueño del negocio en tiempo real, y permite hacer campañas de difusión — todo con comandos de texto simples.

No es un bot genérico: nace específicamente para negocios pequeños y medianos que quieren vender por WhatsApp sin depender de una tienda en línea, sin pagar licencias, y sin necesidad de saber programar para configurarlo.

> Cada persona que instale su propia copia administra su propio negocio de forma completamente independiente. No hay datos compartidos entre instalaciones.

---

## Características

| Módulo | Qué hace |
|---|---|
| 🗂️ **Catálogo** | Productos con nombre, precio, descripción, stock y foto |
| 🛒 **Carrito** | Los clientes arman su pedido por chat antes de confirmar |
| 📦 **Pedidos** | Notificación automática al dueño + seguimiento de estado (pendiente → entregado) |
| 📣 **Broadcast** | Envíos masivos a listas de contactos, con pausa entre mensajes para reducir riesgo de bloqueo |
| 🤖 **Embudo de ventas** | Bienvenida automática al primer contacto + respuestas automáticas por palabra clave (FAQ) |
| 👥 **Control de grupos** | El bot está **apagado en grupos por defecto**; el dueño lo activa grupo por grupo |
| 🎨 **Menú personalizable** | Texto e imagen del menú editables por WhatsApp, sin código |
| ⚙️ **Configuración 100% por chat** | Prefijo de comandos, moneda, dueños del bot — todo desde WhatsApp o desde la terminal |
| 🔑 **Multi-dueño** | Puedes dar permisos de administración a más de un número |

---

## Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- Un número de WhatsApp para vincular como el bot (puede ser tu número personal o uno dedicado al negocio)
- Conexión a internet estable donde vaya a correr el bot (celular con Termux, VPS, PC, etc.)

---

## Instalación

```bash
git clone https://github.com/TU-USUARIO/YuiVentas-MD.git
cd YuiVentas-MD
npm install
npm start
```

Al iniciar por primera vez vas a ver dos preguntas en la terminal:

1. **¿Quieres agregar OTRO número como dueño del bot además del tuyo?**
   Déjalo vacío si vas a administrar el negocio tú solo, o escribe el número (con código de país, sin `+`) de un socio o encargado.

2. **¿Cómo quieres vincular el bot? 1) Código de 8 dígitos · 2) Código QR**
   Elige lo que te sea más cómodo y sigue las instrucciones en pantalla (WhatsApp → Dispositivos vinculados).

El número con el que vincules el bot queda registrado **automáticamente** como dueño principal — no hay que editar ningún archivo.

---

## Primera configuración

Todo lo demás se configura chateando con el propio bot. Puedes hacerlo desde:

- Cualquier chat privado normal con el número del bot, **o**
- El chat **"Tú" / "Mensaje para mí"** en tu propio WhatsApp (funciona como panel de control personal)

```
setnegocio Mi Tienda de Ropa
setbienvenida ¡Hola! Bienvenido a Mi Tienda 🛍️ Escribe *catalogo* para ver los productos.
setpago Yape: 987654321 (Juan Pérez)
setmenu ¡Bienvenido! Hacemos envíos a todo el país 📦
```

> Por defecto el bot **no usa prefijo** — escribes `catalogo`, `menu`, `addproducto`, etc. directamente. Si prefieres que los comandos empiecen con un símbolo (por ejemplo para evitar que se disparen con palabras sueltas en conversaciones normales), puedes activarlo con `setprefijo !` (o el símbolo que prefieras).

---

## Cómo administrarlo

### Agregar productos

```
addproducto Playera azul | 45.00 | Talla M-L, 100% algodón | 10
```
Formato: `Nombre | Precio | Descripción | Stock` (el stock es opcional).

### Ponerle foto a un producto

Responde a una imagen con:
```
fotoproducto playera-azul
```

### Ver y gestionar pedidos

```
pedidos
pedidos 0001 enviado
```

### Enviar una campaña de difusión

```
addcontacto 51987654321
broadcast Tenemos 20% de descuento hoy 🎉
```

### Activar el bot dentro de un grupo

Por seguridad, el bot **no responde en ningún grupo hasta que tú lo actives ahí**. Entra al grupo y, como dueño, escribe:
```
activargrupo
```
Para apagarlo de nuevo: `desactivargrupo`. Para ver en cuáles está activo: `gruposactivos`.

---

## Referencia de comandos

> Los ejemplos usan el bot sin prefijo (configuración por defecto). Si activaste un prefijo, antepónlo a cada comando.

### 🛒 Para clientes

| Comando | Descripción |
|---|---|
| `catalogo` | Ver todos los productos disponibles |
| `ver <ID>` | Ver el detalle de un producto (con foto) |
| `agregar <ID> <cantidad>` | Agregar un producto al carrito |
| `carrito` | Ver el contenido del carrito |
| `quitar <ID>` | Quitar un producto del carrito |
| `vaciarcarrito` | Vaciar el carrito completo |
| `confirmar` | Confirmar el pedido |
| `menu` | Ver el menú de compra |

### ⚙️ Solo para dueños del negocio

<details>
<summary><strong>Productos</strong></summary>

| Comando | Descripción |
|---|---|
| `addproducto Nombre \| Precio \| Descripción \| Stock` | Agregar un producto nuevo |
| `editarproducto <ID> \| campo \| valor` | Editar nombre, precio, descripción, stock o estado (activo/inactivo) |
| `eliminarproducto <ID>` | Eliminar un producto del catálogo |
| `fotoproducto <ID>` | Asignar foto a un producto (respondiendo a una imagen) |

</details>

<details>
<summary><strong>Pedidos</strong></summary>

| Comando | Descripción |
|---|---|
| `pedidos` | Ver todos los pedidos activos |
| `pedidos <ID> <estado>` | Cambiar estado: `pendiente`, `confirmado`, `enviado`, `entregado`, `cancelado` |

</details>

<details>
<summary><strong>Marketing</strong></summary>

| Comando | Descripción |
|---|---|
| `broadcast [lista] <mensaje>` | Enviar un mensaje a todos los contactos de una lista |
| `addcontacto <numero> [lista]` | Agregar un contacto a una lista de difusión |
| `delcontacto <numero> [lista]` | Quitar un contacto de una lista |
| `listas` | Ver todas las listas y cuántos contactos tienen |
| `importargrupo [lista]` | Importar a todos los miembros de un grupo a una lista |
| `addfaq <clave> \| <respuesta>` | Crear una respuesta automática por palabra clave |
| `delfaq <clave>` | Eliminar una respuesta automática |
| `verfaq` | Ver todas las respuestas automáticas configuradas |

</details>

<details>
<summary><strong>Negocio y menú</strong></summary>

| Comando | Descripción |
|---|---|
| `setnegocio <nombre>` | Cambiar el nombre del negocio |
| `setbienvenida <mensaje>` | Cambiar el mensaje de bienvenida automático |
| `setpago <datos>` | Configurar los métodos de pago mostrados a clientes |
| `setmenu <texto>` | Personalizar el texto que ven los clientes en el menú |
| `setmenu default` | Volver al texto de menú por defecto |
| `setmenuimg` | Asignar una imagen personalizada al menú (respondiendo a una foto) |
| `resetmenuimg` | Volver a la imagen de menú por defecto |
| `negocio` | Ver toda la configuración actual del negocio |

</details>

<details>
<summary><strong>Ajustes del bot</strong></summary>

| Comando | Descripción |
|---|---|
| `setprefijo <símbolo>` | Cambiar el prefijo de comandos (o `ninguno` para quitarlo) |
| `setmoneda <símbolo>` | Cambiar el símbolo de moneda mostrado en los precios |
| `addowner <numero>` | Dar permisos de dueño a otro número |
| `delowner <numero>` | Quitar permisos de dueño a un número |
| `verowners` | Ver quiénes administran el bot |
| `ajustes` | Ver toda la configuración técnica actual |

</details>

<details>
<summary><strong>Grupos</strong></summary>

| Comando | Descripción |
|---|---|
| `activargrupo` | Activar el bot dentro del grupo donde se escribe |
| `desactivargrupo` | Desactivar el bot en ese grupo |
| `gruposactivos` | Ver en qué grupos está activo el bot |

</details>

---

## Estructura del proyecto

```
YuiVentas-MD/
├── index.js                # Conexión a WhatsApp, enrutador de comandos, embudo de ventas
├── config.js                # Configuración técnica fija (nombre del bot, carpetas)
├── middlewares.js           # Filtros de permisos (dueño, admin, grupo/privado)
├── pluginLoader.js          # Carga automática de todos los comandos en /plugins
├── interactiveManager.js    # Manejo de respuestas interactivas (listas/botones)
├── limpieza.js              # Limpieza automática de archivos temporales
├── db/                      # Bases de datos en JSON (se generan solas al usar el bot)
│   ├── jsonDB.js             # Helper genérico de lectura/escritura
│   ├── ajustesDB.js          # Dueños, prefijo, moneda, grupos activos
│   ├── negocioDB.js          # Nombre del negocio, bienvenida, menú
│   ├── productosDB.js        # Catálogo de productos
│   ├── carritoDB.js          # Carritos de compra por cliente
│   ├── pedidosDB.js          # Pedidos confirmados
│   ├── contactosDB.js        # Listas de contactos para broadcast
│   └── faqDB.js              # Respuestas automáticas (embudo)
├── plugins/                  # Cada comando es un archivo independiente
├── assets/                   # Imagen por defecto del menú
├── database/                 # (se genera automáticamente) datos guardados en tiempo real
└── session/                  # (se genera automáticamente) sesión de WhatsApp — NUNCA la subas a GitHub
```

---

## Crear un comando nuevo

Cada comando es un archivo `.js` dentro de `plugins/`. Se carga automáticamente al iniciar el bot:

```js
export default {
  command: ["saludo", "hola"],
  category: "General",
  description: "Responde con un saludo",
  ownerOnly: false, // true = solo los dueños del bot pueden usarlo

  run: async (sock, msg, args, context) => {
    await sock.sendMessage(context.chatId, { text: "¡Hola! 👋" }, { quoted: msg });
  },
};
```

**Flags disponibles:** `ownerOnly`, `groupOnly`, `privateOnly`, `bypassGrupoInactivo` (para que el comando funcione incluso en grupos donde el bot está apagado — úsalo solo si tiene sentido, como `activargrupo`).

---

## Notas de seguridad y privacidad

- **No subas las carpetas `session/` ni `database/` a un repositorio público.** Ahí vive tu sesión activa de WhatsApp y los datos reales de tu negocio (productos, pedidos, contactos, clientes). El `.gitignore` incluido ya las excluye.
- El envío masivo (`broadcast`) incluye una pausa configurable entre mensajes (`ajustes.broadcastDelayMs`) para reducir el riesgo de que WhatsApp marque el número como spam. Aun así, úsalo con criterio: listas grandes y mensajes muy frecuentes pueden derivar en el bloqueo del número.
- El bot está **apagado en grupos por defecto** justamente para evitar que responda o quede expuesto en grupos donde no debería tener actividad. Actívalo solo donde de verdad lo necesites.

---

## Solución de problemas

**El bot no responde a nada en el chat "Tú" (Mensaje para mí).**
WhatsApp a veces sincroniza esos mensajes con un tipo distinto (`append` en vez de `notify`). El bot ya contempla ambos casos; si sigue sin responder, confirma que reiniciaste (`npm start`) después de actualizar `index.js`.

**Un comando responde "Este comando es exclusivo del creador".**
Ese número no está en la lista de dueños. Revisa quién es dueño con `verowners` (desde un número que sí lo sea), o agrégalo con `addowner <numero>`.

**El bot no responde dentro de un grupo.**
Está apagado ahí por diseño. Actívalo con `activargrupo`, escrito **dentro** de ese grupo.

**Errores de `Bad MAC` / `Failed to decrypt` en la consola al conectar.**
Es normal justo después de vincular el bot por primera vez, mientras WhatsApp termina de sincronizar sesiones. No afecta el funcionamiento.

---

## Licencia

MIT — libre para usar, modificar y redistribuir.

> Base original: *TheYui-MD* por AmilcarGit — adaptado por completo a un flujo de marketing y ventas.
