# Configuração do Cloudinary

Este projeto foi configurado para salvar todas as imagens no Cloudinary.

## Passos para Configuração

### 1. Atualizar as Credenciais

Abra o arquivo `src/config/cloudinary.js` e substitua os valores placeholder com suas credenciais reais do Cloudinary:

```javascript
export const cloudinaryConfig = {
  cloudName: 'dgxctlzvj', // Já configurado
  apiKey: '652967333396711', // Substitua com sua API Key
  apiSecret: '4VzsxhWXJrDjrPB9bLbMOylLsaQ', // Substitua com sua API Secret
  uploadPreset: 'ml_default', // Configure no dashboard se necessário
};
```

**Onde encontrar suas credenciais:**
- Acesse o dashboard do Cloudinary
- Vá em "Settings" > "API Keys"
- Copie a API Key e API Secret

### 2. Configurar Upload Preset (Opcional)

Para fazer upload sem assinatura (útil para apps mobile):

1. Acesse o dashboard do Cloudinary
2. Vá em "Settings" > "Upload"
3. Crie um "Unsigned upload preset"
4. Copie o nome do preset e atualize `uploadPreset` no arquivo de configuração

### 3. Upload de Imagens Estáticas

Para fazer upload das imagens estáticas da pasta `assets/images/`:

1. Atualize as credenciais no arquivo `upload-images.js`
2. Execute o script:
   ```bash
   node upload-images.js
   ```

## Como Funciona

### No App (ProductForm.js)

Quando você adiciona ou edita um produto e seleciona uma foto:

1. A imagem é selecionada via `expo-document-picker`
2. A imagem é automaticamente enviada para o Cloudinary
3. A URL segura da imagem é salva no produto
4. A imagem é exibida usando a URL do Cloudinary

### Benefícios

- ✅ Imagens armazenadas na nuvem
- ✅ Otimização automática de imagens
- ✅ CDN global para entrega rápida
- ✅ Transformações de imagem on-the-fly
- ✅ Backup automático

## Exemplo de Uso

```javascript
import { uploadToCloudinary } from '../config/cloudinary';

// Fazer upload de uma imagem
const imageUrl = await uploadToCloudinary(imageUri);
console.log('Imagem salva em:', imageUrl);
```

## Troubleshooting

**Erro de upload:**
- Verifique se as credenciais estão corretas
- Verifique se o upload preset está configurado corretamente
- Verifique se você tem permissão para fazer uploads

**Imagens não aparecendo:**
- Verifique se o cloud name está correto
- Verifique se a URL está sendo salva corretamente no banco de dados
