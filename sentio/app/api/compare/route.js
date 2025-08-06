import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Pinecone ve Gemini istemcilerini başlat
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { productIds, userProfile, comparisonType } = await request.json();

    // Ürün ID'leri kontrolü
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return NextResponse.json(
        { error: 'En az 2 ürün ID\'si gerekli' },
        { status: 400 }
      );
    }

    if (productIds.length > 5) {
      return NextResponse.json(
        { error: 'En fazla 5 ürün karşılaştırılabilir' },
        { status: 400 }
      );
    }

    console.log('⚖️  Ürün karşılaştırması başlatılıyor:', productIds);

    const index = pinecone.index('sentio-main-index');

    // Tüm ürünleri paralel olarak getir
    const productPromises = productIds.map(async (productId) => {
      const query = await index.fetch([`product_${productId}`]);
      
      if (!query.records || !query.records[`product_${productId}`]) {
        throw new Error(`Ürün bulunamadı: ${productId}`);
      }
      
      return {
        id: productId,
        ...query.records[`product_${productId}`].metadata
      };
    });

    const products = await Promise.all(productPromises);

    // Her ürün için yorum özetlerini getir (paralel)
    const reviewIdMapping = {
      '1': ['1', '2', '3', '4'], // iPhone 15 Pro Max
      '2': ['5', '6', '7'], // Samsung Galaxy S24 Ultra
      '3': ['8', '9', '10'], // Sony WH-1000XM5
      '4': ['11', '12', '13'], // MacBook Air M3
      '5': ['14', '15', '16'], // Dyson V15 Detect
      '6': ['17', '18'], // AirPods Pro 2
      '7': ['19', '20'], // Dell XPS 15
      '8': ['21', '22', '23'], // Xiaomi Robot Süpürge
    };

    const reviewSummaryPromises = products.map(async (product) => {
      try {
        const reviewIds = reviewIdMapping[product.id] || [];
        const reviewVectorIds = reviewIds.map(id => `review_${id}`);
        
        if (reviewVectorIds.length === 0) {
          return {
            productId: product.id,
            averageRating: 0,
            totalReviews: 0,
            sentiment: 'neutral'
          };
        }

        const reviewsQuery = await index.fetch(reviewVectorIds);
        const reviews = Object.values(reviewsQuery.records).map(record => ({
          rating: record.metadata.rating || 0,
          comment: record.metadata.comment || record.metadata.content || ''
        }));

        const avgRating = calculateAverageRating(reviews);
        const sentiment = avgRating >= 4 ? 'positive' : avgRating <= 2 ? 'negative' : 'neutral';

        return {
          productId: product.id,
          averageRating: avgRating,
          totalReviews: reviews.length,
          sentiment: sentiment,
          topComments: reviews.slice(0, 5).map(r => r.comment).filter(c => c.length > 10)
        };

      } catch (error) {
        console.log(`⚠️  ${product.id} için yorumlar getirilemedi:`, error.message);
        return {
          productId: product.id,
          averageRating: 0,
          totalReviews: 0,
          sentiment: 'neutral',
          topComments: []
        };
      }
    });

    const reviewSummaries = await Promise.all(reviewSummaryPromises);

    // Ürünleri yorum bilgileriyle birleştir
    const enrichedProducts = products.map(product => {
      const reviewData = reviewSummaries.find(r => r.productId === product.id);
      return { ...product, reviewData };
    });

    // Gemini ile akıllı karşılaştırma yap
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const comparisonPrompt = createComparisonPrompt(enrichedProducts, userProfile, comparisonType);
    
    const result = await model.generateContent(comparisonPrompt);
    const comparisonAnalysis = result.response.text();

    // Teknik özellikleri karşılaştır
    const technicalComparison = createTechnicalComparison(enrichedProducts);

    // Fiyat-performans analizi
    const pricePerformanceAnalysis = createPricePerformanceAnalysis(enrichedProducts);

    return NextResponse.json({
      products: enrichedProducts.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        averageRating: p.reviewData.averageRating,
        totalReviews: p.reviewData.totalReviews,
        sentiment: p.reviewData.sentiment
      })),
      comparison: {
        aiAnalysis: comparisonAnalysis,
        technicalComparison,
        pricePerformanceAnalysis,
        recommendation: generateRecommendation(enrichedProducts, userProfile, comparisonType)
      },
      userProfile: userProfile || null,
      comparisonType: comparisonType || 'general'
    });

  } catch (error) {
    console.error('❌ Karşılaştırma API hatası:', error);
    return NextResponse.json(
      { error: 'Karşılaştırma sırasında bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

function createComparisonPrompt(products, userProfile, comparisonType) {
  const productDetails = products.map(p => {
    return `
ÜRÜN: ${p.name} (${p.brand})
FİYAT: ${p.price} TL
KATEGORİ: ${p.category}
ÖZELLİKLER: ${p.features || 'Belirtilmemiş'}
AÇIKLAMA: ${p.description || 'Açıklama yok'}
KULLANICI PUANI: ${p.reviewData.averageRating.toFixed(1)}/5 (${p.reviewData.totalReviews} yorum)
KULLANICI MEMNUNIYETI: ${p.reviewData.sentiment}
${p.reviewData.topComments.length > 0 ? 'ÖRNEK YORUMLAR: ' + p.reviewData.topComments.slice(0, 2).join(' | ') : ''}
`;
  }).join('\n---\n');

  const userContext = userProfile ? `
KULLANICI PROFİLİ:
- Öncelikler: ${userProfile.priorities || 'Belirtilmemiş'}
- Bütçe: ${userProfile.budget || 'Belirtilmemiş'}
- Kullanım Amacı: ${userProfile.usage || 'Belirtilmemiş'}
- Deneyim Seviyesi: ${userProfile.experience || 'Belirtilmemiş'}
` : '';

  const comparisonTypeContext = {
    'price-performance': 'Fiyat-performans odaklı karşılaştırma yap.',
    'features': 'Teknik özellik odaklı karşılaştırma yap.',
    'user-reviews': 'Kullanıcı yorumları odaklı karşılaştırma yap.',
    'overall': 'Genel kapsamlı karşılaştırma yap.',
    'general': 'Genel karşılaştırma yap.'
  }[comparisonType || 'general'];

  return `
Aşağıdaki ürünleri detaylı olarak karşılaştır:

${productDetails}

${userContext}

KARŞILAŞTIRMA TİPİ: ${comparisonTypeContext}

Lütfen şu formatta bir analiz yap:

## GÜÇLÜ YÖNLER
[Her ürünün en güçlü 2-3 yönünü listele]

## ZAYIF YÖNLER  
[Her ürünün geliştirilmesi gereken yönlerini belirt]

## FİYAT-PERFORMANS ANALİZİ
[Hangi ürün hangi durumda daha mantıklı]

## KULLANIM SENARYOLARI
[Hangi ürün hangi kullanıcı tipi için uygun]

## SONUÇ VE ÖNERİ
[Net bir öneri ver - hangi ürünü neden tercih edilmeli]

${userProfile ? 'Kullanıcı profiline göre özelleştir.' : ''}
Objektif ol ve veriye dayalı analiz yap. Pazarlama dili kullanma.
`;
}

function createTechnicalComparison(products) {
  // Ortak özellikleri bul ve karşılaştır
  const comparison = {
    price: products.map(p => ({ name: p.name, value: p.price })),
    category: products.map(p => ({ name: p.name, value: p.category })),
    brand: products.map(p => ({ name: p.name, value: p.brand })),
    averageRating: products.map(p => ({ 
      name: p.name, 
      value: p.reviewData.averageRating.toFixed(1) 
    })),
    totalReviews: products.map(p => ({ 
      name: p.name, 
      value: p.reviewData.totalReviews 
    }))
  };

  return comparison;
}

function createPricePerformanceAnalysis(products) {
  // Fiyat-performans skorları hesapla
  const analysis = products.map(product => {
    const price = product.price || 0;
    const rating = product.reviewData.averageRating || 0;
    const reviewCount = product.reviewData.totalReviews || 0;
    
    // Basit fiyat-performans skoru (rating / (price/1000) * log(reviewCount+1))
    const pricePerformanceScore = price > 0 ? 
      (rating / (price / 1000)) * Math.log(reviewCount + 1) : 0;
    
    return {
      name: product.name,
      price: price,
      rating: rating,
      reviewCount: reviewCount,
      pricePerformanceScore: Math.round(pricePerformanceScore * 100) / 100,
      category: getPerformanceCategory(pricePerformanceScore)
    };
  });

  // En iyi fiyat-performansa göre sırala
  analysis.sort((a, b) => b.pricePerformanceScore - a.pricePerformanceScore);

  return analysis;
}

function getPerformanceCategory(score) {
  if (score >= 5) return 'Mükemmel';
  if (score >= 3) return 'İyi';
  if (score >= 1) return 'Orta';
  return 'Düşük';
}

function generateRecommendation(products, userProfile, comparisonType) {
  // Basit kural tabanlı öneri sistemi
  const sortedByRating = [...products].sort((a, b) => 
    b.reviewData.averageRating - a.reviewData.averageRating
  );
  
  const sortedByPrice = [...products].sort((a, b) => a.price - b.price);
  
  const recommendations = {
    highestRated: {
      product: sortedByRating[0],
      reason: 'En yüksek kullanıcı puanına sahip'
    },
    bestValue: {
      product: sortedByPrice[0],
      reason: 'En ekonomik seçenek'
    },
    balanced: {
      product: products.reduce((best, current) => {
        const bestScore = (best.reviewData.averageRating || 0) / Math.log((best.price || 1) / 1000 + 1);
        const currentScore = (current.reviewData.averageRating || 0) / Math.log((current.price || 1) / 1000 + 1);
        return currentScore > bestScore ? current : best;
      }),
      reason: 'Fiyat-performans dengesi en iyi'
    }
  };

  return recommendations;
}

function calculateAverageRating(reviews) {
  const validRatings = reviews.filter(r => r.rating && r.rating > 0);
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((acc, review) => acc + review.rating, 0);
  return sum / validRatings.length;
}

// GET isteği için bilgi döndür
export async function GET() {
  return NextResponse.json({
    message: 'Sentio Ürün Karşılaştırma API\'si çalışıyor',
    version: '1.0.0',
    endpoints: {
      compare: 'POST /api/compare'
    },
    usage: {
      productIds: 'Array of product IDs to compare (2-5 products)',
      userProfile: 'Optional user preferences object',
      comparisonType: 'Optional: price-performance, features, user-reviews, overall'
    }
  });
}
