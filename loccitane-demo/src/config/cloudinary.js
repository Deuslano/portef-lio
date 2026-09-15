// Configuração do Cloudinary
// Substitua com suas credenciais reais do Cloudinary
import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';

export const cloudinaryConfig = {
  cloudName: 'dgxctlzvj', // Seu cloud name do Cloudinary
  apiKey: '652967333396711', // Substitua com sua API Key
  apiSecret: '4VzsxhWXJrDjrPB9bLbMOylLsaQ', // Substitua com sua API Secret
  uploadPreset: 'ml_default', // Preset de upload (configure no dashboard do Cloudinary se necessário)
};

// URL base para uploads
export const getCloudinaryUrl = (resourceType = 'image') => {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
};

// Função para gerar assinatura para signed upload
const generateSignature = (params, apiSecret) => {
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + apiSecret;
  
  return CryptoJS.SHA1(signatureString).toString();
};

// Função para fazer upload de arquivo para Cloudinary (imagem ou PDF)
export const uploadToCloudinary = async (fileUri) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Para React Native/Expo, precisamos converter a URI para o formato correto
    const uri = fileUri;
    const fileType = uri.substring(uri.lastIndexOf('.') + 1).toLowerCase();
    const fileName = uri.substring(uri.lastIndexOf('/') + 1);
    
    // Determinar o tipo de recurso (image ou raw para PDFs)
    const resourceType = fileType === 'pdf' ? 'raw' : 'image';
    const mimeType = fileType === 'pdf' ? 'application/pdf' : `image/${fileType}`;
    
    // Parâmetros para assinatura (sem upload preset para signed upload)
    const params = {
      timestamp: timestamp,
    };
    
    const signature = generateSignature(params, cloudinaryConfig.apiSecret);
    
    // Criar FormData
    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      // Para web, usar Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('file', blob);
    } else {
      // Para mobile, usar URI
      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: fileName || (fileType === 'pdf' ? 'document.pdf' : 'photo.jpg'),
      });
    }
    
    formData.append('api_key', cloudinaryConfig.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    
    const uploadResponse = await fetch(getCloudinaryUrl(resourceType), {
      method: 'POST',
      body: formData,
    });
    
    const data = await uploadResponse.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return data.secure_url; // Retorna a URL segura do arquivo
  } catch (error) {
    console.error('Erro ao fazer upload para Cloudinary:', error);
    throw error;
  }
};
