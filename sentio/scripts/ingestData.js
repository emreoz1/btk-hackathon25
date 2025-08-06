// Environment variables'ı yükle
require('dotenv').config({ path: '.env.local' });

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Örnek ürün verileri - gerçek projede Akakçe'den çekilecek
const sampleProducts = [
  {
    productId: '1',
    name: 'iPhone 15 Pro Max 256GB Doğal Titanyum',
    description: 'Apple iPhone 15 Pro Max, A17 Pro çip, 48MP kamera sistemi, Titanium tasarım',
    price: 85999,
    category: 'Telefon',
    brand: 'Apple',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop&crop=center',
    features: ['A17 Pro çip', '48MP kamera', '256GB depolama', 'Titanyum gövde', '5G']
  },
  {
    productId: '2',
    name: 'Samsung Galaxy S24 Ultra 512GB Siyah',
    description: 'Samsung Galaxy S24 Ultra, Snapdragon 8 Gen 3, 200MP kamera, S Pen dahil',
    price: 79999,
    category: 'Telefon',
    brand: 'Samsung',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop&crop=center',
    features: ['Snapdragon 8 Gen 3', '200MP kamera', '512GB depolama', 'S Pen', '5G']
  },
  {
    productId: '3',
    name: 'Sony WH-1000XM5 Kablosuz Kulaklık',
    description: 'Sony WH-1000XM5, aktif gürültü engelleme, 30 saat pil ömrü',
    price: 12999,
    category: 'Kulaklık',
    brand: 'Sony',
    imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop&crop=center',
    features: ['Aktif gürültü engelleme', '30 saat pil', 'Hi-Res Audio', 'Çabuk şarj']
  },
  {
    productId: '4',
    name: 'MacBook Air M3 13" 8GB 256GB',
    description: 'Apple MacBook Air M3 çip, 13 inç Liquid Retina ekran, fanless tasarım',
    price: 45999,
    category: 'Laptop',
    brand: 'Apple',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center',
    features: ['M3 çip', '13" Retina ekran', '8GB RAM', '256GB SSD', 'Fanless']
  },
  {
    productId: '5',
    name: 'Dyson V15 Detect Kablosuz Süpürge',
    description: 'Dyson V15 Detect, lazer ile toz tespiti, 60 dakika çalışma süresi',
    price: 24999,
    category: 'Ev Elektroniği',
    brand: 'Dyson',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    features: ['Lazer toz tespiti', '60 dk pil', 'HEPA filtreleme', 'Akıllı sensor']
  },
  {
    productId: '6',
    name: 'AirPods Pro 2. Nesil',
    description: 'Apple AirPods Pro 2. nesil, aktif gürültü engelleme, USB-C şarj kutusu',
    price: 8999,
    category: 'Kulaklık',
    brand: 'Apple',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop&crop=center',
    features: ['Aktif gürültü engelleme', 'Şeffaflık modu', 'USB-C', 'H2 çip']
  },
  {
    productId: '7',
    name: 'Dell XPS 15 Intel i7 32GB 1TB',
    description: 'Dell XPS 15, Intel Core i7, 32GB RAM, 1TB SSD, 15.6" 4K ekran',
    price: 68999,
    category: 'Laptop',
    brand: 'Dell',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center',
    features: ['Intel Core i7', '32GB RAM', '1TB SSD', '4K ekran', 'RTX grafik']
  },
  {
    productId: '8',
    name: 'Xiaomi Robot Süpürge S10+',
    description: 'Xiaomi Robot Süpürge S10+, LiDAR navigasyon, otomatik toz boşaltma',
    price: 15999,
    category: 'Ev Elektroniği',
    brand: 'Xiaomi',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    features: ['LiDAR navigasyon', 'Otomatik boşaltma', 'Harita kaydetme', 'Sessiz çalışma']
  }
];

// Pinecone'daki mevcut verileri temizleme fonksiyonu
async function clearPineconeData() {
  try {
    console.log('🧹 Pinecone\'daki mevcut veriler temizleniyor...');

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = 'sentio-main-index';
    const index = pinecone.index(indexName);

    // Tüm product_ ile başlayan vektörleri sil
    const productIds = sampleProducts.map(p => `product_${p.productId}`);
    
    console.log(`🗑️  ${productIds.length} ürün verisi siliniyor...`);
    await index.deleteMany(productIds);
    
    console.log('✅ Eski veriler başarıyla temizlendi!');
    
    // Biraz bekle ki silme işlemi tamamlansın
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.error('❌ Veri temizleme hatası:', error.message);
    throw error;
  }
}

async function ingestData() {
  try {
    console.log('🚀 Veri yükleme işlemi başlıyor...');

    // API anahtarlarını kontrol et
    if (!process.env.PINECONE_API_KEY || !process.env.GEMINI_API_KEY) {
      throw new Error('PINECONE_API_KEY ve GEMINI_API_KEY environment variable\'ları gerekli');
    }

    // Önce mevcut verileri temizle
    await clearPineconeData();

    // Pinecone ve Gemini bağlantılarını başlat
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // Pinecone index'ini al
    const indexName = 'sentio-main-index';
    console.log(`📊 Pinecone index'ine bağlanıyor: ${indexName}`);
    const index = pinecone.index(indexName);

    console.log('🔄 Ürün verilerini işleniyor...');
    
    const vectors = [];

    for (const product of sampleProducts) {
      // Her ürün için embedding metni oluştur
      const embeddingText = `${product.name} ${product.description} ${product.brand} ${product.category} ${product.features.join(' ')}`;
      
      console.log(`📝 "${product.name}" için embedding oluşturuluyor...`);
      
      // Gemini ile embedding oluştur
      const result = await model.embedContent(embeddingText);
      const embedding = result.embedding.values;

      // Pinecone için vektör formatına çevir
      const vector = {
        id: `product_${product.productId}`,
        values: embedding,
        metadata: {
          type: 'product',
          productId: product.productId,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          brand: product.brand,
          imageUrl: product.imageUrl,
          features: product.features
        }
      };

      vectors.push(vector);
    }

    // Vektörleri Pinecone'a yükle
    console.log('📤 Vektörler Pinecone\'a yükleniyor...');
    await index.upsert(vectors);

    console.log('✅ Veri yükleme işlemi başarıyla tamamlandı!');
    console.log(`📊 Toplam ${vectors.length} ürün yüklendi.`);

  } catch (error) {
    console.error('❌ Veri yükleme hatası:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  ingestData();
}

module.exports = { ingestData };
