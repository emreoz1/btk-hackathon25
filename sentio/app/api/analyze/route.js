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
    const { productId } = await request.json();

    // Ürün ID kontrolü
    if (!productId) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🔍 Ürün analizi başlatılıyor, ID:', productId);

    // Pinecone'dan ilgili ürüne ait yorumları çek
    const index = pinecone.index('sentio-main-index');
    
    // Önce ürün bilgisini al
    const productQuery = await index.fetch([`product_${productId}`]);

    if (!productQuery.records || !productQuery.records[`product_${productId}`]) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    const product = productQuery.records[`product_${productId}`].metadata;

    // Yorumları çek - productId'ye göre review ID'lerini belirle ve fetch et
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

    const reviewIds = reviewIdMapping[productId] || [];
    const reviewVectorIds = reviewIds.map(id => `review_${id}`);
    
    let reviews = [];
    
    if (reviewVectorIds.length > 0) {
      const reviewsQuery = await index.fetch(reviewVectorIds);
      
      reviews = Object.values(reviewsQuery.records).map(record => ({
        rating: record.metadata.rating || 0,
        comment: record.metadata.comment || record.metadata.content || '',
        date: record.metadata.date || ''
      }));
    }

    const reviewTexts = reviews.map(review => 
      `[${review.rating}/5 yıldız] ${review.comment}`
    ).join('\n\n');

    // Gemini ile yorum analizi yap
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const analysisPrompt = `
Aşağıdaki ürün yorumlarını detaylı olarak analiz et:

ÜRÜN: ${product.name}
YORUM SAYISI: ${reviews.length}

YORUMLAR:
${reviewTexts}

Lütfen şu formatta bir analiz yap:

ARTILARI (En çok beğenilen 3-5 özellik):
- [Özellik 1]: [Kısa açıklama]
- [Özellik 2]: [Kısa açıklama]

EKSİLERİ (En çok eleştirilen 3-5 yön):
- [Problem 1]: [Kısa açıklama]
- [Problem 2]: [Kısa açıklama]

GENEL DUYGUSAL DURUM: [pozitif/negatif/nötr]

KULLANICI MEMNUNIYET PUANI: [0-10 arası puan]

ÖZET: [Ürün hakkında 2-3 cümlelik genel değerlendirme]

Objektif ol ve yorumların gerçek içeriğine dayalı bir analiz yap.
`;

    const result = await model.generateContent(analysisPrompt);
    const analysisText = result.response.text();

    // Gemini'dan gelen metni parse et
    const analysis = parseAnalysisText(analysisText, reviews);

    return NextResponse.json({
      productId,
      productName: product.name,
      totalReviews: reviews.length,
      analysis,
      averageRating: calculateAverageRating(reviews),
      ratingDistribution: calculateRatingDistribution(reviews)
    });

  } catch (error) {
    console.error('❌ Analiz API hatası:', error);
    return NextResponse.json(
      { error: 'Analiz sırasında bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

// Gemini'dan gelen analiz metnini parse et
function parseAnalysisText(text, reviews) {
  try {
    const lines = text.split('\n').filter(line => line.trim());
    
    let pros = [];
    let cons = [];
    let sentiment = 'neutral';
    let score = 5;
    let summary = '';
    
    let currentSection = '';
    
    for (let line of lines) {
      line = line.trim();
      
      if (line.includes('ARTILARI') || line.includes('BEĞENILEN')) {
        currentSection = 'pros';
        continue;
      } else if (line.includes('EKSİLERİ') || line.includes('ELEŞTİRİLEN')) {
        currentSection = 'cons';
        continue;
      } else if (line.includes('DUYGUSAL DURUM') || line.includes('SENTIMENT')) {
        const sentimentMatch = line.match(/(pozitif|negatif|nötr|positive|negative|neutral)/i);
        if (sentimentMatch) {
          sentiment = sentimentMatch[1].toLowerCase();
          if (sentiment === 'pozitif') sentiment = 'positive';
          if (sentiment === 'negatif') sentiment = 'negative';
          if (sentiment === 'nötr') sentiment = 'neutral';
        }
        continue;
      } else if (line.includes('MEMNUNIYET PUANI') || line.includes('PUAN')) {
        const scoreMatch = line.match(/(\d+(?:\.\d+)?)/);
        if (scoreMatch) {
          score = parseFloat(scoreMatch[1]);
        }
        continue;
      } else if (line.includes('ÖZET') || line.includes('SUMMARY')) {
        currentSection = 'summary';
        continue;
      }
      
      if (line.startsWith('-') && currentSection === 'pros') {
        pros.push(line.substring(1).trim());
      } else if (line.startsWith('-') && currentSection === 'cons') {
        cons.push(line.substring(1).trim());
      } else if (currentSection === 'summary' && line.length > 10) {
        summary += line + ' ';
      }
    }
    
    // Eğer parse işlemi başarısız olduysa, basit bir fallback
    if (pros.length === 0 && cons.length === 0) {
      const avgRating = calculateAverageRating(reviews);
      pros = avgRating >= 4 ? ["Kullanıcılar bu üründen memnun"] : ["Bazı özellikler beğeniliyor"];
      cons = avgRating <= 2 ? ["Kullanıcılar bazı sorunlar yaşıyor"] : ["Geliştirilmesi gereken yönleri var"];
      sentiment = avgRating >= 4 ? 'positive' : avgRating <= 2 ? 'negative' : 'neutral';
      score = avgRating * 2; // 5 yıldızı 10 puana çevir
      summary = `Bu ürün ${reviews.length} kullanıcı yorumuna göre ${avgRating.toFixed(1)}/5 puan almış.`;
    }
    
    return {
      pros: pros.slice(0, 5), // En fazla 5 artı
      cons: cons.slice(0, 5), // En fazla 5 eksi
      overallSentiment: sentiment,
      userSatisfactionScore: Math.round(score * 10) / 10, // Virgülden sonra 1 basamak
      summary: summary.trim() || `${reviews.length} kullanıcı yorumu analiz edildi.`
    };
    
  } catch (error) {
    console.error('Parse hatası:', error);
    
    // Fallback analiz
    const avgRating = calculateAverageRating(reviews);
    return {
      pros: ["Analiz tamamlanıyor..."],
      cons: ["Analiz tamamlanıyor..."],
      overallSentiment: avgRating >= 4 ? 'positive' : avgRating <= 2 ? 'negative' : 'neutral',
      userSatisfactionScore: avgRating * 2,
      summary: `${reviews.length} kullanıcı yorumu analiz ediliyor.`
    };
  }
}

// Ortalama rating hesapla
function calculateAverageRating(reviews) {
  const validRatings = reviews.filter(r => r.rating && r.rating > 0);
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((acc, review) => acc + review.rating, 0);
  return sum / validRatings.length;
}

// Rating dağılımını hesapla
function calculateRatingDistribution(reviews) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    if (review.rating && review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++;
    }
  });
  
  return distribution;
}

// GET isteği için bilgi döndür
export async function GET() {
  return NextResponse.json({
    message: 'Sentio Yorum Analiz API\'si çalışıyor',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze'
    }
  });
}
