# 💵 Dólar AppzPlay (dolar.appzplay.online)

Plataforma de alta velocidad optimizada para móviles para la consulta en vivo de la **TRM (Tasa Representativa del Mercado) oficial en Colombia**, cálculo de conversión instantánea, comparador de divisas (Euro, USDT Cripto, Casas de cambio), histórico con gráficas interactivas y **alertas automáticas por Telegram**.

---

## 🚀 Características Principales

- **Datos 100% Oficiales y Gratuitos:** Consumo directo de la API abierta SODA de la Superintendencia Financiera de Colombia (`datos.gov.co`).
- **Alerta de las 4:30 PM (La TRM de Mañana):** Monitoreo intensivo de lunes a viernes entre las 4:15 PM y 5:45 PM para capturar y publicar en Telegram la TRM de mañana en cuanto es emitida.
- **Viralidad en WhatsApp:** Botón de 1 toque que genera el mensaje listo para reenviar con el precio del día y el enlace a la web.
- **Ultra Rápido y Mobile-First:** Diseñado en Node.js + Tailwind CSS con modo oscuro moderno (fintech).
- **SEO & Google Search Console:** Microdatos estructurados Schema.org (`FinancialProduct`), OpenGraph, `sitemap.xml` y `robots.txt`.
- **Blindaje y Monetización con AdSense:** Secciones editoriales profundas para evitar rechazos por "contenido de escaso valor", banners adaptativos sin CLS, archivo `ads.txt` y páginas legales requeridas (`/privacidad`, `/terminos`, `/contacto`).
- **Despliegue Continuo con Coolify:** Listo con `Dockerfile` ligero `node:22-alpine` y healthcheck en `/health`.

---

## 🛠️ Variables de Entorno en Coolify

En tu panel de **Coolify** (bajo el proyecto `dolar.appzplay.online`), configura las siguientes variables en la sección **Environment Variables**:

| Variable | Valor Recomendado / Descripción |
| :--- | :--- |
| `PORT` | `3000` |
| `SITE_URL` | `https://dolar.appzplay.online` |
| `ADSENSE_CLIENT_ID` | `ca-pub-XXXXXXXXXXXXXXXX` *(Tu ID de editor AdSense)* |
| `TELEGRAM_BOT_TOKEN` | Token del bot de `@BotFather` *(Opcional)* |
| `TELEGRAM_CHANNEL_ID` | ID o `@Username` del canal (ej: `@DolarAppzPlay`) *(Opcional)* |

> **Nota:** Si no configuras las variables de Telegram de inmediato, la aplicación seguirá funcionando al 100% y simplemente registrará en logs que Telegram está inactivo.

---

## 🤖 Configuración del Bot de Telegram (Paso a Paso)

1. Abre Telegram y busca a **`@BotFather`**.
2. Envía el comando `/newbot` y asígnale un nombre (ej. `Dolar AppzPlay Bot`) y usuario (ej. `DolarAppzPlay_Bot`).
3. Copia el **HTTP API Token** y pégalo en la variable `TELEGRAM_BOT_TOKEN` en Coolify.
4. Crea tu canal público de Telegram (ejemplo: `@DolarAppzPlay`).
5. Agrega tu bot al canal como **Administrador** con permisos para publicar mensajes.
6. En `TELEGRAM_CHANNEL_ID` coloca el username del canal con `@` (ejemplo: `@DolarAppzPlay`) o el ID numérico.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Iniciar en modo producción
npm start
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## 📦 Despliegue en Coolify

1. Conecta tu repositorio de GitHub `https://github.com/DiegoAzz/dolar.git`.
2. En **Build Pack**, selecciona `Dockerfile`.
3. Configura el puerto en `3000`.
4. Asigna el dominio `dolar.appzplay.online`.
5. Haz clic en **Deploy**. ¡Listo! Coolify se encargará de compilar la imagen y asignarle SSL automático con Let's Encrypt.
