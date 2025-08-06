import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { productName, brand, model: productModel, keywords, category } = await request.json();

    // Girdi kontrolü
    if (!productName || productName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Ürün adı gerekli' },
        { status: 400 }
      );
    }

    console.log('📝 SEO açıklama üretimi için:', { productName, brand, productModel, keywords });

    const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-002" });

    // SEO açıklama üretme prompt'u
    const prompt = `
Sen bir e-ticaret SEO uzmanısın. Verilen ürün bilgilerine dayanarak, SEO optimized, kullanıcıyı ikna edici ve fayda odaklı ürün açıklamaları üreteceksin.

Ürün Bilgileri:
- Ürün Adı: ${productName}
${brand ? `- Marka: ${brand}` : ''}
${productModel ? `- Model: ${productModel}` : ''}
${keywords ? `- Anahtar Kelimeler: ${keywords}` : ''}
${category ? `- Kategori: ${category}` : ''}

SEO Açıklama Gereksinimleri:
1. 150-300 kelime arası olmalı
2. Doğal bir şekilde anahtar kelimeler yerleştirilmeli
3. Ürünün özelliklerinden ziyade faydalarına odaklanmalı
4. Kullanıcıyı satın almaya teşvik edici dil kullanmalı
5. Arama motorları için optimize edilmeli
6. Duygusal bağlantı kurmalı
7. Teknik terimler basit dille açıklanmalı

3 farklı alternatif üret:
1. "Premium" tonda - lüks ve kalite vurgusu
2. "Pratik" tonda - günlük kullanım ve kolaylık vurgusu  
3. "Değer" tonda - fiyat-performans ve tasarruf vurgusu

Her alternatif için:
- Ana başlık (60 karakter altı)
- Meta açıklama (160 karakter altı)
- Uzun açıklama (150-300 kelime)
- Önerilen etiketler

Yanıtını JSON formatında ver.`;

    const result = await genModel.generateContent(prompt);
    const responseText = result.response.text();

    // JSON parse etmeye çalış
    let parsedResult;
    try {
      // Gemini'den gelen metni temizle ve JSON olarak parse et
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      
      // Eğer JSON parse edilemezse, yapılandırılmış bir yanıt oluştur
      const lines = responseText.split('\n').filter(line => line.trim());
      parsedResult = {
        alternatives: [
          {
            tone: "Premium",
            title: `${productName} - Premium Kalite`,
            metaDescription: `Yüksek kaliteli ${productName}. En iyi ${brand || 'marka'} deneyimi için hemen keşfedin!`,
            longDescription: responseText.substring(0, 300),
            tags: keywords ? keywords.split(',').map(k => k.trim()) : [productName, brand, productModel].filter(Boolean)
          }
        ]
      };
    }

    // Yanıtı düzenle ve gerekli alanları kontrol et
    if (!parsedResult.alternatives) {
      parsedResult = {
        alternatives: [parsedResult]
      };
    }

    // Her alternatifi kontrol et ve eksik alanları tamamla
    parsedResult.alternatives.forEach((alt, index) => {
      if (!alt.tone) alt.tone = ['Premium', 'Pratik', 'Değer'][index] || 'Premium';
      if (!alt.title) alt.title = `${productName} - ${alt.tone}`;
      if (!alt.metaDescription) alt.metaDescription = `${productName} için en iyi ${alt.tone.toLowerCase()} çözüm.`;
      if (!alt.longDescription) alt.longDescription = `Bu ${productName} ${alt.tone.toLowerCase()} kalitesi arayanlar için tasarlandı.`;
      if (!alt.tags) alt.tags = [productName, brand, productModel].filter(Boolean);
    });

    return NextResponse.json({
      success: true,
      descriptions: parsedResult.alternatives,
      metadata: {
        productName,
        brand,
        model: productModel,
        keywords,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('SEO açıklama üretimi hatası:', error);
    return NextResponse.json(
      { error: 'SEO açıklama üretimi sırasında bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
}
