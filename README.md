# DropShell - Tienda Online Fidget Toys

Tienda online profesional con panel administrativo, integración PayPal y facturación automática.

## 🎯 Características

✅ **Frontend**
- Landing page profesional
- Catálogo de productos dinámico
- Carrito de compras (localStorage)
- Checkout con PayPal integrado
- Diseño responsive minimalista

✅ **Backend (Node.js + Express)**
- API REST completa
- Autenticación admin
- Gestión de productos (CRUD)
- Gestión de órdenes
- Facturación automática
- Base de datos JSON (escalable a MongoDB)

✅ **Panel Administrativo**
- Dashboard con estadísticas
- Ver todas las órdenes
- Cambiar estado de órdenes
- Crear/editar/eliminar productos
- Descargar facturas

## 📋 Requisitos

- Node.js 14+
- npm o yarn
- Cuenta PayPal Developer
- GitHub (para versionar)
- Render (backend gratuito)
- Cloudflare Pages (frontend gratuito)

## 🚀 Instalación Local

### 1. Clonar o descargar proyecto

```bash
git clone https://github.com/tuusuario/dropsell.git
cd dropsell
```

### 2. Instalar dependencias backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:
```
PORT=5000
ADMIN_TOKEN=admin123
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_secret
PAYPAL_MODE=sandbox
FRONTEND_URL=http://localhost:3000
```

### 4. Ejecutar servidor

```bash
npm start
# o para desarrollo con auto-reload
npm run dev
```

Backend corre en: http://localhost:5000

### 5. Abrir frontend

Abre `frontend/index.html` en el navegador.

## 🔑 Credenciales Admin (por defecto)

- **Usuario:** admin
- **Contraseña:** admin123

⚠️ Cambia esto en producción

## 📊 Estructura de archivos

```
dropsell/
├── backend/
│   ├── server.js          # Servidor Express principal
│   ├── package.json       # Dependencias
│   ├── .env.example       # Variables de entorno
│   └── data/
│       ├── products.json  # Base de datos productos
│       ├── orders.json    # Base de datos órdenes
│       └── users.json     # Base de datos usuarios
└── frontend/
    └── index.html         # Aplicación web completa
```

## 🌐 Deployment

### Backend en Render

1. Crear cuenta en https://render.com
2. Conectar repositorio GitHub
3. Crear "New Web Service"
4. Configurar:
   - **Name:** dropsell-backend
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Añadir variables de entorno en Render dashboard
6. Deploy automático cuando hagas push a GitHub

### Frontend en Cloudflare Pages

1. Crear cuenta en https://pages.cloudflare.com
2. Conectar GitHub
3. Seleccionar repositorio dropsell
4. Configurar:
   - **Build Command:** (dejar vacío)
   - **Build Output Directory:** frontend
5. Deploy automático
6. Tu URL: `https://dropsell.pages.dev`

### Conectar Frontend + Backend

En `frontend/index.html`, línea 293:
```javascript
const API_URL = 'https://dropsell-backend.onrender.com'; // Tu URL de Render
```

## 💳 Integración PayPal

### Configurar PayPal Sandbox

1. Ir a https://developer.paypal.com/dashboard/
2. Crear cuenta Developer
3. Ir a Apps & Credentials
4. Copiar "Client ID" y "Secret"
5. Pegar en `.env`:
   ```
   PAYPAL_CLIENT_ID=ABC123...
   PAYPAL_CLIENT_SECRET=XYZ789...
   ```

### En frontend (línea 2 del HTML)

```html
<script src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&currency=EUR"></script>
```

Reemplaza `TU_CLIENT_ID` con tu PayPal Client ID.

### Cambiar a Producción

Cuando estés listo para dinero real:

1. En PayPal: cambiar de Sandbox a Live
2. Cambiar credenciales en `.env`
3. En `.env`: `PAYPAL_MODE=live`
4. Deploy

## 📝 API Endpoints

### Públicos

- `GET /api/products` - Lista de productos
- `GET /api/products/:id` - Producto por ID
- `POST /api/orders` - Crear orden

### Admin (requieren `x-admin-token`)

- `POST /api/admin/login` - Login
- `GET /api/admin/orders` - Ver órdenes
- `PUT /api/admin/orders/:id` - Actualizar orden
- `GET /api/admin/stats` - Estadísticas
- `POST /api/admin/products` - Crear producto
- `PUT /api/admin/products/:id` - Actualizar producto
- `DELETE /api/admin/products/:id` - Eliminar producto
- `GET /api/admin/invoice/:id` - Descargar factura

## 💰 Flujo de compra

1. Cliente ve productos
2. Añade a carrito
3. Abre checkout
4. Rellena datos (nombre, email, dirección)
5. Paga con PayPal
6. Se crea orden automáticamente
7. Stock se actualiza
8. Admin recibe notificación
9. Admin marca como enviado
10. Cliente recibe factura

## 📧 Próximas mejoras

- [ ] Envío de emails automático
- [ ] Integración AliExpress API
- [ ] Sistema de cupones
- [ ] Revisiones de clientes
- [ ] App mobile
- [ ] Base de datos MongoDB
- [ ] Integración Stripe
- [ ] Notificaciones SMS

## 🔒 Seguridad

⚠️ Para producción:

1. Cambiar contraseña admin
2. Usar HTTPS siempre
3. Validar inputs en backend
4. Usar JWT en lugar de tokens simples
5. Actualizar dependencias: `npm audit fix`
6. Configurar CORS correctamente
7. Rate limiting en APIs

## 📞 Soporte

Para dudas o problemas:
1. Revisa el terminal de errores
2. Abre una issue en GitHub
3. Contacta a soporteDropShell@email.com

## 📄 Licencia

MIT

---

**¡Listo para empezar a vender!** 🚀
