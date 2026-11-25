FROM node:22-alpine

# Instalar zona horaria para que el cron funcione en hora de Colombia (America/Bogota)
RUN apk add --no-cache tzdata
ENV TZ=America/Bogota

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente
COPY . .

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
