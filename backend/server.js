const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de datos
const PRODUCTS_FILE = path.join(__dirname, 'data/products.json');
const ORDERS_FILE = path.join(__dirname, 'data/orders.json');
const USERS_FILE = path.join(__dirname, 'data/users.json');
const REVIEWS_FILE = path.join(__dirname, 'data/reviews.json');

// Configurar Nodemailer
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  console.log('✅ Email service configurado');
}

// Crear archivos si no existen
function ensureDataFiles() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([
      { 
        id: uuidv4(), 
        name: "Spin Racer Pro", 
        price: 12.99, 
        image: "https://via.placeholder.com/300?text=Spin+Racer", 
        description: "Spinner metálico premium", 
        stock: 50,
        avgRating: 0,
        reviewCount: 0
      }
    ], null, 2));
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([
      { username: "admin", password: "admin123", role: "admin" }
    ], null, 2));
  }
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify([], null, 2));
  }
}

ensureDataFiles();

// Funciones de lectura/escritura
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// 📧 Función para enviar email al admin
async function sendAdminNotification(order) {
  if (!transporter) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `🎉 NUEVA COMPRA: ${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #ffd700;">
          <h2 style="color: #ffd700; margin-top: 0;">¡Nueva Compra Recibida!</h2>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detalles del Cliente</h3>
            <p><strong>Nombre:</strong> ${order.customer}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Teléfono:</strong> ${order.phone || 'No proporcionado'}</p>
            <p><strong>Dirección:</strong> ${order.address || 'No proporcionada'}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Productos Comprados</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                  <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                  <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">€${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div style="background: #ffd700; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: right;">
            <p style="margin: 0; color: #333;">
              <strong>TOTAL: €${order.total.toFixed(2)}</strong>
            </p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ ACCIÓN REQUERIDA:</strong> Ve a tu panel admin para procesar esta compra.
            </p>
          </div>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de notificación enviado al admin para orden ${order.id}`);
  } catch (error) {
    console.error('❌ Error enviando email al admin:', error.message);
  }
}

// 📧 Función para enviar email al cliente
async function sendShippingNotification(order) {
  if (!transporter) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: `📦 Tu pedido ha sido enviado - ${order.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #28a745;">
          <h2 style="color: #28a745; margin-top: 0;">¡Tu Pedido ha sido Enviado! 📦</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hola <strong>${order.customer}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            ¡Buenas noticias! Tu pedido ha sido despachado y está en camino hacia ti. 
            Recibirás tu paquete en los próximos 7-15 días hábiles.
          </p>
          
          <div style="background: #f0f8f5; padding: 20px; border-radius: 5px; margin: 30px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Detalles de tu Pedido</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                  <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                  <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">€${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
              <p style="margin: 0; text-align: right;">
                <strong style="font-size: 18px; color: #28a745;">TOTAL: €${order.total.toFixed(2)}</strong>
              </p>
            </div>
          </div>
          
          <div style="background: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <p style="margin: 0; color: #e65100;">
              <strong>📮 Dirección de entrega:</strong><br>
              ${order.address || 'Dirección no proporcionada'}
            </p>
          </div>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de envío enviado al cliente ${order.email}`);
  } catch (error) {
    console.error('❌ Error enviando email al cliente:', error.message);
  }
}

// ===== RUTAS PÚBLICAS =====

// GET Productos
app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  res.json(products);
});

// GET Producto por ID
app.get('/api/products/:id', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

// POST Crear orden
app.post('/api/orders', (req, res) => {
  const { customer, email, items, total, paypalTransactionId, address, phone } = req.body;
  
  const orders = readJSON(ORDERS_FILE);
  const products = readJSON(PRODUCTS_FILE);
  
  const newOrder = {
    id: `ORD-${Date.now()}`,
    customer,
    email,
    address: address || 'No proporcionada',
    phone: phone || 'No proporcionado',
    items,
    total,
    paypalTransactionId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    invoiceNumber: `INV-${Date.now()}`
  };
  
  // Actualizar stock
  items.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      product.stock -= item.quantity;
    }
  });
  
  orders.push(newOrder);
  writeJSON(ORDERS_FILE, orders);
  writeJSON(PRODUCTS_FILE, products);
  
  sendAdminNotification(newOrder);
  
  res.json({ ok: true, order: newOrder });
});

// GET Reseñas de producto
app.get('/api/reviews/:productId', (req, res) => {
  const reviews = readJSON(REVIEWS_FILE);
  const productReviews = reviews
    .filter(r => r.productId === req.params.productId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(productReviews);
});

// POST Crear reseña
app.post('/api/reviews', (req, res) => {
  const { productId, name, rating, text } = req.body;
  
  if (!productId || !name || !rating || !text) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  
  const reviews = readJSON(REVIEWS_FILE);
  const products = readJSON(PRODUCTS_FILE);
  
  const newReview = {
    id: uuidv4(),
    productId,
    name,
    rating: Math.min(5, Math.max(1, parseInt(rating))),
    text,
    createdAt: new Date().toISOString()
  };
  
  reviews.push(newReview);
  writeJSON(REVIEWS_FILE, reviews);
  
  // Actualizar rating promedio del producto
  const productReviews = reviews.filter(r => r.productId === productId);
  const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  
  const product = products.find(p => p.id === productId);
  if (product) {
    product.avgRating = avgRating;
    product.reviewCount = productReviews.length;
    writeJSON(PRODUCTS_FILE, products);
  }
  
  res.json({ ok: true, review: newReview });
});

// ===== RUTAS ADMIN =====

// Verificar autenticación
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (token === process.env.ADMIN_TOKEN || token === 'admin123') {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
};

// POST Login admin
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ ok: true, token: 'admin123' });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// GET Órdenes
app.get('/api/admin/orders', adminAuth, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  res.json(orders);
});

// PUT Actualizar estado de orden
app.put('/api/admin/orders/:id', adminAuth, (req, res) => {
  const { status } = req.body;
  const orders = readJSON(ORDERS_FILE);
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  
  order.status = status;
  writeJSON(ORDERS_FILE, orders);
  
  if (status === 'shipped' || status === 'sent' || status === 'delivery') {
    sendShippingNotification(order);
  }
  
  res.json({ ok: true, order });
});

// GET Dashboard stats
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const products = readJSON(PRODUCTS_FILE);
  
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  
  res.json({
    totalSales,
    totalOrders,
    totalProducts,
    recentOrders: orders.slice(-5).reverse()
  });
});

// POST Crear producto
app.post('/api/admin/products', adminAuth, (req, res) => {
  const { name, price, image, description, stock } = req.body;
  const products = readJSON(PRODUCTS_FILE);
  
  const newProduct = {
    id: uuidv4(),
    name,
    price,
    image,
    description,
    stock,
    avgRating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  res.json({ ok: true, product: newProduct });
});

// PUT Actualizar producto
app.put('/api/admin/products/:id', adminAuth, (req, res) => {
  const { name, price, image, description, stock } = req.body;
  const products = readJSON(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  
  Object.assign(product, { name, price, image, description, stock });
  writeJSON(PRODUCTS_FILE, products);
  res.json({ ok: true, product });
});

// DELETE Eliminar producto
app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const filtered = products.filter(p => p.id !== req.params.id);
  writeJSON(PRODUCTS_FILE, filtered);
  res.json({ ok: true });
});

// GET Descargar factura
app.get('/api/admin/invoice/:id', adminAuth, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
  
  const invoice = `
=== FACTURA DROPSHELL ===
Número: ${order.invoiceNumber}
Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES')}

CLIENTE:
${order.customer}
${order.email}
${order.phone}
${order.address}

PRODUCTOS:
${order.items.map(i => `- ${i.name}: ${i.quantity}x €${i.price}`).join('\n')}

TOTAL: €${order.total.toFixed(2)}
Estado: ${order.status}
ID PayPal: ${order.paypalTransactionId}
  `;
  
  res.type('text/plain').send(invoice);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DropShell Backend corriendo en puerto ${PORT}`);
  console.log(`💼 API en: http://localhost:${PORT}/api`);
});
