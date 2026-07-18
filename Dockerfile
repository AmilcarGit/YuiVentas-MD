# YuiVentas-MD — imagen ligera basada en Node LTS
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# La sesión y la base de datos deben vivir en volúmenes persistentes
# (ver README, sección Docker) para no perder el negocio en cada rebuild.
VOLUME ["/app/session", "/app/database"]

# Necesario correr con -it (modo interactivo) la primera vez, para
# poder escanear el QR o ingresar el código de vinculación.
CMD ["node", "index.js"]
