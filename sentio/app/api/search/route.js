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
    const { query, category, minPrice, maxPrice } = await request.json();

    // Arama sorgusu kontrolü
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Arama sorgusu gerekli' },
        { status: 400 }
      );
    }

    console.log('🔍 Arama sorgusu:', query);

    // Gemini ile sorguyu vektöre çevir
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await model.embedContent(query);
    const searchVector = embeddingResult.embedding.values;

    // Pinecone filtreleri oluştur
    let filter = { type: 'product' };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price['$gte'] = minPrice;
      if (maxPrice) filter.price['$lte'] = maxPrice;
    }

    // Pinecone'da anlamsal arama yap
    const index = pinecone.index('sentio-main-index');
    const searchResults = await index.query({
      topK: 20, // İlk 20 sonucu getir
      vector: searchVector,
      includeMetadata: true,
      filter: filter
    });

    console.log('📊 Bulunan sonuç sayısı:', searchResults.matches.length);

    // Sonuçları formatla
    const products = searchResults.matches.map(match => ({
      id: match.metadata.productId,
      name: match.metadata.name,
      description: match.metadata.description,
      price: match.metadata.price,
      category: match.metadata.category,
      brand: match.metadata.brand,
      imageUrl: match.metadata.imageUrl,
      features: match.metadata.features,
      score: match.score,
      relevance: Math.round(match.score * 100)
    }));

    // Arama analitiği için Gemini'dan ek açıklama al (isteğe bağlı)
    let searchInsight = null;
    if (products.length > 0) {
      try {
        const insightModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const insightPrompt = `Kullanıcının "${query}" araması için bulunan ${products.length} ürün arasından en uygun olanları kısaca önerir misin? Sadece 2-3 cümle ile.`;
        
        const insightResult = await insightModel.generateContent(insightPrompt);
        searchInsight = insightResult.response.text();
      } catch (error) {
        console.log('⚠️  Arama önerisi oluşturulamadı:', error.message);
      }
    }

    return NextResponse.json({
      query,
      products,
      totalResults: products.length,
      searchInsight,
      filters: { category, minPrice, maxPrice }
    });

  } catch (error) {
    console.error('❌ Arama API hatası:', error);
    return NextResponse.json(
      { error: 'Arama sırasında bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}

// GET isteği için basit bilgi döndür
export async function GET() {
  return NextResponse.json({
    message: 'Sentio Arama API\'si çalışıyor',
    version: '1.0.0',
    endpoints: {
      search: 'POST /api/search'
    }
  });
}
