const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas de datos
const PRODUCTS_FILE = path.join(__dirname, 'data/products.json');
const ORDERS_FILE = path.join(__dirname, 'data/orders.json');
const USERS_FILE = path.join(__dirname, 'data/users.json');

// Crear archivos si no existen
function ensureDataFiles() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([
      { id: uuidv4(), name: "Spin Racer Pro", price: 12.99, image: "🎯", description: "Spinner metálico premium", stock: 50 },
      { id: uuidv4(), name: "Gear Mesh", price: 14.99, image: "⚙️", description: "Engranajes con giro suave", stock: 45 },
      { id: uuidv4(), name: "Magnet Click", price: 13.49, image: "🧲", description: "Clicks magnéticos satisfactorios", stock: 60 },
      { id: uuidv4(), name: "Pop-It Metal", price: 11.99, image: "🔷", description: "Burbujas de acero inoxidable", stock: 55 },
      { id: uuidv4(), name: "Chain Fidget", price: 10.99, image: "✦", description: "Cadena articulada fluida", stock: 40 },
      { id: uuidv4(), name: "Zen Click", price: 9.99, image: "◈", description: "Mecanismo de clicker satisfactorio", stock: 70 }
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
}

ensureDataFiles();

// Funciones de lectura/escritura
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
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
  const { customer, email, items, total, paypalTransactionId } = req.body;
  
  const orders = readJSON(ORDERS_FILE);
  const products = readJSON(PRODUCTS_FILE);
  
  const newOrder = {
    id: `ORD-${Date.now()}`,
    customer,
    email,
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
  
  res.json({ ok: true, order: newOrder });
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

// GET Órdenes (Admin)
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
  res.json({ ok: true, order });
});

// GET Dashboard stats (Admin)
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
    recentOrders: orders.slice(-5)
  });
});

// POST Crear producto (Admin)
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
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  res.json({ ok: true, product: newProduct });
});

// PUT Actualizar producto (Admin)
app.put('/api/admin/products/:id', adminAuth, (req, res) => {
  const { name, price, image, description, stock } = req.body;
  const products = readJSON(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  
  Object.assign(product, { name, price, image, description, stock });
  writeJSON(PRODUCTS_FILE, products);
  res.json({ ok: true, product });
});

// DELETE Eliminar producto (Admin)
app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const filtered = products.filter(p => p.id !== req.params.id);
  writeJSON(PRODUCTS_FILE, filtered);
  res.json({ ok: true });
});

// GET Descargar factura (Admin)
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
  console.log(`📊 Admin en: http://localhost:${PORT}/admin.html`);
});
