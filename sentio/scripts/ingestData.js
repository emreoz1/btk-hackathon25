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

// Örnek yorum verileri - gerçek projede kullanıcı yorumlarından çekilecek
const sampleReviews = [
  // iPhone 15 Pro Max yorumları
  {
    reviewId: '1',
    productId: '1',
    rating: 5,
    comment: 'Kamera kalitesi inanılmaz! 48MP ana kamera gerçekten fark yaratıyor. Titanyum kasası çok premium hissettiriyor.',
    date: '2024-01-15'
  },
  {
    reviewId: '2',
    productId: '1',
    rating: 4,
    comment: 'Performans mükemmel ama fiyat çok yüksek. Pil ömrü beklediğimden biraz daha kısa.',
    date: '2024-01-20'
  },
  {
    reviewId: '3',
    productId: '1',
    rating: 5,
    comment: 'A17 Pro çip sayesinde oyunlarda hiç takılma yok. Video editing için de harika.',
    date: '2024-01-25'
  },
  {
    reviewId: '4',
    productId: '1',
    rating: 3,
    comment: 'İyi telefon ama Android\'den geçiş biraz zor oldu. Şarj hızı yavaş.',
    date: '2024-01-30'
  },

  // Samsung Galaxy S24 Ultra yorumları
  {
    reviewId: '5',
    productId: '2',
    rating: 5,
    comment: 'S Pen ile not almak harika! 200MP kamera detay yakalamada çok başarılı.',
    date: '2024-02-01'
  },
  {
    reviewId: '6',
    productId: '2',
    rating: 4,
    comment: 'Ekran kalitesi muhteşem, renk doğruluğu çok iyi. Sadece biraz ağır.',
    date: '2024-02-05'
  },
  {
    reviewId: '7',
    productId: '2',
    rating: 5,
    comment: 'Snapdragon 8 Gen 3 performans canavarı! Hiç ısınma sorunu yaşamadım.',
    date: '2024-02-10'
  },

  // Sony WH-1000XM5 yorumları
  {
    reviewId: '8',
    productId: '3',
    rating: 5,
    comment: 'Gürültü engelleme teknolojisi mükemmel! Uçakta bile çok sessiz.',
    date: '2024-01-10'
  },
  {
    reviewId: '9',
    productId: '3',
    rating: 4,
    comment: 'Ses kalitesi harika ama uzun kullanımda kulak ağrısı yapabiliyor.',
    date: '2024-01-12'
  },
  {
    reviewId: '10',
    productId: '3',
    rating: 5,
    comment: '30 saat pil ömrü gerçekten doğru! Haftalar boyunca şarj etmeye gerek yok.',
    date: '2024-01-18'
  },

  // MacBook Air M3 yorumları
  {
    reviewId: '11',
    productId: '4',
    rating: 5,
    comment: 'M3 çip inanılmaz hızlı! Video montaj bile çok akıcı. Fanless tasarım sessizliği mükemmel.',
    date: '2024-02-15'
  },
  {
    reviewId: '12',
    productId: '4',
    rating: 4,
    comment: 'Çok hafif ve taşınabilir. Sadece portlar biraz az olmuş.',
    date: '2024-02-20'
  },
  {
    reviewId: '13',
    productId: '4',
    rating: 5,
    comment: 'Ekran kalitesi harika, renk gamı çok geniş. Tasarım çok şık.',
    date: '2024-02-25'
  },

  // Dyson V15 Detect yorumları
  {
    reviewId: '14',
    productId: '5',
    rating: 4,
    comment: 'Lazer ile toz gösterme özelliği çok ilginç! Temizlik performansı mükemmel.',
    date: '2024-01-05'
  },
  {
    reviewId: '15',
    productId: '5',
    rating: 3,
    comment: 'Güçlü ama çok gürültülü. Fiyat da oldukça yüksek.',
    date: '2024-01-08'
  },
  {
    reviewId: '16',
    productId: '5',
    rating: 5,
    comment: '60 dakika pil ömrü tüm evi temizlemeye yetiyor. HEPA filtre gerçekten etkili.',
    date: '2024-01-12'
  },

  // AirPods Pro 2. Nesil yorumları
  {
    reviewId: '17',
    productId: '6',
    rating: 5,
    comment: 'H2 çip ile gürültü engelleme çok gelişmiş. Şeffaflık modu da harika.',
    date: '2024-01-22'
  },
  {
    reviewId: '18',
    productId: '6',
    rating: 4,
    comment: 'USB-C geçiş çok iyi olmuş. Ses kalitesi mükemmel ama pahalı.',
    date: '2024-01-28'
  },

  // Dell XPS 15 yorumları
  {
    reviewId: '19',
    productId: '7',
    rating: 5,
    comment: '4K ekran kalitesi muhteşem! RTX grafik kartı ile oyunlar da akıcı.',
    date: '2024-02-12'
  },
  {
    reviewId: '20',
    productId: '7',
    rating: 4,
    comment: 'Performans harika ama biraz ağır. Pil ömrü ortalama.',
    date: '2024-02-18'
  },

  // Xiaomi Robot Süpürge yorumları
  {
    reviewId: '21',
    productId: '8',
    rating: 4,
    comment: 'LiDAR navigasyon çok akıllı, mobilyaları çarpmıyor. Sessizlik konusunda iddia edildiği kadar iyi değil.',
    date: '2024-01-14'
  },
  {
    reviewId: '22',
    productId: '8',
    rating: 5,
    comment: 'Otomatik toz boşaltma özelliği harika! Haftalarca elle müdahale etmeye gerek yok.',
    date: '2024-01-20'
  },
  {
    reviewId: '23',
    productId: '8',
    rating: 4,
    comment: 'Fiyat/performans oranı çok iyi. Harita kaydetme özelliği kullanışlı.',
    date: '2024-01-26'
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
    const reviewIds = sampleReviews.map(r => `review_${r.reviewId}`);
    
    console.log(`🗑️  ${productIds.length} ürün ve ${reviewIds.length} yorum verisi siliniyor...`);
    await index.deleteMany([...productIds, ...reviewIds]);
    
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

    // Ürünleri işle
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

    console.log('💬 Yorum verilerini işleniyor...');
    
    // Yorumları işle
    for (const review of sampleReviews) {
      // Her yorum için embedding metni oluştur
      const embeddingText = `${review.comment} rating: ${review.rating} stars`;
      
      console.log(`💭 Yorum ${review.reviewId} için embedding oluşturuluyor...`);
      
      // Gemini ile embedding oluştur
      const result = await model.embedContent(embeddingText);
      const embedding = result.embedding.values;

      // Pinecone için vektör formatına çevir
      const vector = {
        id: `review_${review.reviewId}`,
        values: embedding,
        metadata: {
          type: 'review',
          reviewId: review.reviewId,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
          content: review.comment, // Alternatif field adı
          date: review.date
        }
      };

      vectors.push(vector);
    }

    // Vektörleri Pinecone'a yükle
    console.log('📤 Vektörler Pinecone\'a yükleniyor...');
    await index.upsert(vectors);

    console.log('✅ Veri yükleme işlemi başarıyla tamamlandı!');
    console.log(`📊 Toplam ${sampleProducts.length} ürün ve ${sampleReviews.length} yorum yüklendi.`);
    console.log(`🔢 Toplam ${vectors.length} vektör Pinecone'a kaydedildi.`);

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
