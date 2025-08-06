// Environment variables'ı yükle
require('dotenv').config({ path: '.env.local' });

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// JSON dosyalarından verileri oku
function loadDataFromJson() {
  const dataDir = path.join(__dirname, '..', 'data');
  
  // Ürün verilerini oku
  const productsPath = path.join(dataDir, 'products.json');
  let sampleProducts = [];
  if (fs.existsSync(productsPath)) {
    const productsData = fs.readFileSync(productsPath, 'utf8');
    sampleProducts = JSON.parse(productsData);
  } else {
    console.warn('⚠️  products.json dosyası bulunamadı:', productsPath);
  }

  // Yorum verilerini oku
  const reviewsPath = path.join(dataDir, 'reviews.json');
  let sampleReviews = [];
  if (fs.existsSync(reviewsPath)) {
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    sampleReviews = JSON.parse(reviewsData);
  } else {
    console.warn('⚠️  reviews.json dosyası bulunamadı:', reviewsPath);
  }

  return { sampleProducts, sampleReviews };
}

// Pinecone'da mevcut verileri kontrol etme ve silme fonksiyonu
async function clearPineconeDataIfExists() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = 'sentio-main-index';
    const index = pinecone.index(indexName);

    console.log('🔍 Pinecone\'da tüm mevcut veriler siliniyor...');

    try {
      // Tüm vektörleri sil (namespace belirtmeyerek tüm vektörler silinir)
      console.log('🗑️  Pinecone\'daki tüm veriler siliniyor...');
      await index.deleteAll();
      
      console.log('✅ Pinecone\'daki tüm veriler başarıyla temizlendi!');
      
      // Biraz bekle ki silme işlemi tamamlansın
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return true; // Silme işlemi yapıldı
      
    } catch (deleteError) {
      console.log('ℹ️  Pinecone silme işleminde hata:', deleteError.message);
      return false; // Silme işlemi yapılamadı
    }
    
  } catch (error) {
    console.error('❌ Veri kontrol/temizleme hatası:', error.message);
    throw error;
  }
}

async function ingestData() {
  try {
    console.log('🚀 Veri yükleme işlemi başlıyor...');

    // JSON dosyalarından verileri yükle
    console.log('📄 JSON dosyalarından veriler okunuyor...');
    const { sampleProducts, sampleReviews } = loadDataFromJson();
    
    if (sampleProducts.length === 0 || sampleReviews.length === 0) {
      throw new Error('JSON dosyalarından veri okunamadı. Lütfen data/products.json ve data/reviews.json dosyalarının mevcut olduğundan emin olun.');
    }
    
    console.log(`📊 ${sampleProducts.length} ürün ve ${sampleReviews.length} yorum yüklendi.`);

    // API anahtarlarını kontrol et
    if (!process.env.PINECONE_API_KEY || !process.env.GEMINI_API_KEY) {
      throw new Error('PINECONE_API_KEY ve GEMINI_API_KEY environment variable\'ları gerekli');
    }

    // Önce mevcut verileri kontrol et ve varsa temizle
    const wasCleared = await clearPineconeDataIfExists();

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
