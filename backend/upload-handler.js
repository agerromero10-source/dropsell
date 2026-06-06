// Funciones para manejar imágenes en base64
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'data/images');

// Crear carpeta si no existe
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function saveBase64Image(base64String, filename) {
  try {
    const imageId = Date.now() + '-' + Math.random().toString(36).substring(7);
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(path.join(IMAGES_DIR, imageId + '.jpg'), imageBuffer);
    return `/api/images/${imageId}.jpg`;
  } catch (e) {
    console.error('Error guardando imagen:', e);
    return null;
  }
}

module.exports = { saveBase64Image };
