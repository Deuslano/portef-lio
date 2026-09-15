const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuração do Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dgxctlzvj';
const CLOUDINARY_API_KEY = 'YOUR_API_KEY'; // Substitua com sua API Key
const CLOUDINARY_API_SECRET = 'YOUR_API_SECRET'; // Substitua com sua API Secret
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Ou crie um unsigned upload preset no dashboard

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Diretório das imagens
const IMAGES_DIR = path.join(__dirname, 'assets/images');

// Função para fazer upload de uma imagem
async function uploadImage(filePath, publicId) {
  try {
    const formData = new FormData();
    
    // Ler o arquivo como buffer
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('public_id', publicId);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', Math.floor(Date.now() / 1000));
    
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log(`✅ Upload bem-sucedido: ${publicId}`);
    console.log(`   URL: ${response.data.secure_url}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao fazer upload de ${publicId}:`, error.message);
    throw error;
  }
}

// Função principal
async function uploadAllImages() {
  console.log('🚀 Iniciando upload das imagens para Cloudinary...\n');
  
  try {
    // Ler todos os arquivos no diretório de imagens
    const files = fs.readdirSync(IMAGES_DIR);
    
    // Filtrar apenas arquivos de imagem
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
    });
    
    console.log(`📁 Encontradas ${imageFiles.length} imagens para upload\n`);
    
    // Fazer upload de cada imagem
    for (const file of imageFiles) {
      const filePath = path.join(IMAGES_DIR, file);
      const publicId = `loccitane/${path.parse(file).name}`; // Usar nome do arquivo como public_id
      
      await uploadImage(filePath, publicId);
    }
    
    console.log('\n✨ Upload de todas as imagens concluído!');
  } catch (error) {
    console.error('\n❌ Erro durante o processo de upload:', error);
  }
}

// Executar o script
uploadAllImages();
