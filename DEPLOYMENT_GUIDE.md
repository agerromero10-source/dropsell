# 🚀 GUÍA RÁPIDA DE DEPLOYMENT

## PASO 1: Preparar GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/dropsell.git
git push -u origin main
```

## PASO 2: Deployment Backend (Render)

1. Entra en https://render.com
2. Sign up / Login
3. Click "New Web Service"
4. Conecta GitHub y selecciona "dropsell"
5. Configuración:
   - **Name:** dropsell-backend
   - **Runtime:** Node
   - **Branch:** main
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
6. Click "Environment" y añade:
   ```
   PORT=5000
   ADMIN_TOKEN=admin123
   PAYPAL_CLIENT_ID=tu_paypal_id
   PAYPAL_CLIENT_SECRET=tu_paypal_secret
   ```
7. Deploy

**Tu URL será:** https://dropsell-backend.onrender.com

## PASO 3: Deployment Frontend (Cloudflare Pages)

1. Entra en https://pages.cloudflare.com
2. Sign up / Login
3. Click "Connect to Git"
4. Selecciona "dropsell" de GitHub
5. Configuración:
   - **Production branch:** main
   - **Build command:** (dejar vacío)
   - **Build output directory:** frontend
6. Deploy

**Tu URL será:** https://dropsell.pages.dev (o tu dominio)

## PASO 4: Conectar Frontend + Backend

Edita `frontend/index.html` línea ~293:

```javascript
const API_URL = 'https://dropsell-backend.onrender.com';
```

Haz push a GitHub:
```bash
git add .
git commit -m "Connect to backend"
git push
```

Frontend se actualiza automáticamente.

## PASO 5: Configurar PayPal

1. Ve a https://developer.paypal.com
2. Crea app "Merchant"
3. Copia Client ID
4. En Render, actualiza variable:
   ```
   PAYPAL_CLIENT_ID=tu_nuevo_id
   ```
5. En `frontend/index.html` línea 2:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=tu_nuevo_id&currency=EUR"></script>
   ```
6. Push y listo

## ✅ Verificar que funciona

1. Abre https://dropsell.pages.dev
2. Vea si cargan los productos
3. Prueba agregar al carrito
4. Haz checkout de prueba (PayPal sandbox)
5. Admin: click "Admin" → user: admin, pass: admin123
6. Verifica que aparezca la orden

## 🎉 ¡LISTO PARA VENDER!

Tu tienda está en vivo. Ahora:

1. Cambia contraseña admin en `.env` de Render
2. Configura PayPal en LIVE (no sandbox)
3. Comienza a agregar productos reales
4. Promociona tu tienda
5. ¡A ganar dinero! 💰

---

## Problemas comunes

**"API returns 404"**
- Verifica que API_URL en index.html sea correcta
- Comprueba que Render esté running (no "suspended")

**"PayPal no funciona"**
- Asegúrate de que Client ID esté en `<script>`
- Verifica que esté en LIVE (no sandbox) si estás en producción

**"No me conecta al admin"**
- Usuario: admin
- Contraseña: admin123 (o la que configuraste en .env)
- Verifica que seas localhost (auth está hardcodeada)

**"El stock no se actualiza"**
- Revisa terminal de Render por errores
- Verifica permissions de `data/` folder

---

**¡Necesitas ayuda?** Abre issue en GitHub o contacta soporte.
