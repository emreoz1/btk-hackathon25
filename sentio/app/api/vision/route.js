import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Gemini istemcisini başlat
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json(
        { error: 'Görsel dosyası gerekli' },
        { status: 400 }
      );
    }

    console.log('🖼️ Görsel analizi başlıyor...');

    // Görseli base64 formatına çevir
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Gemini Vision modeli ile görseli analiz et
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Bu görselde gördüğün ürünü detaylı bir şekilde tanımla. Ürünün adını, kategorisini, renk, marka (varsa), önemli özelliklerini ve teknik detaylarını belirt. 

Örneğin:
- Ürün adı: iPhone 15 Pro Max
- Kategori: Akıllı Telefon
- Renk: Titanyum Mavi
- Marka: Apple
- Özellikler: 6.7 inç ekran, titanium kasa, Pro kamera sistemi
- Teknik detaylar: A17 Pro işlemci, 48MP ana kamera

Eğer birden fazla ürün varsa, en belirgin olanını tanımla. Sadece gördüğün ürünü tanımla, varsayımda bulunma.`;

    const imageData = {
      inlineData: {
        data: base64Image,
        mimeType: image.type
      }
    };

    const result = await visionModel.generateContent([prompt, imageData]);
    const description = result.response.text();

    console.log('✅ Görsel analizi tamamlandı');
    console.log('📝 Açıklama:', description);

    // Gemini'dan gelen açıklamayı arama sorgusu için optimize et
    const optimizationModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const optimizationPrompt = `Aşağıdaki ürün açıklamasını, e-ticaret sitesinde arama yapmak için kısa ve etkili anahtar kelimelere çevir:

${description}

Çıktı formatı: "marka model kategori önemli_özellik1 önemli_özellik2"
Örnek: "Apple iPhone 15 Pro akıllı telefon 48MP kamera titanium"

Maksimum 10 kelime kullan.`;

    const optimizationResult = await optimizationModel.generateContent(optimizationPrompt);
    const searchQuery = optimizationResult.response.text().trim();

    console.log('🔍 Optimized search query:', searchQuery);

    return NextResponse.json({
      success: true,
      originalDescription: description,
      searchQuery: searchQuery,
      imageInfo: {
        name: image.name,
        size: image.size,
        type: image.type
      }
    });

  } catch (error) {
    console.error('❌ Vision API hatası:', error);
    return NextResponse.json(
      { 
        error: 'Görsel analizi sırasında bir hata oluştu', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET isteği için bilgi döndür
export async function GET() {
  return NextResponse.json({
    message: 'Vision API - Görsel analizi için POST request kullanın',
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: '10MB'
  });
}
