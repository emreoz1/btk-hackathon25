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
Sen uzman bir e-ticaret SEO copywriter'ısın. Görüşlerin satış odaklı, SEO optimize ve kullanıcı deneyimi dostu ürün açıklamaları üretmek.

Ürün Bilgileri:
- Ürün Adı: ${productName}
${brand ? `- Marka: ${brand}` : ''}
${productModel ? `- Model: ${productModel}` : ''}
${keywords ? `- Anahtar Kelimeler: ${keywords}` : ''}
${category ? `- Kategori: ${category}` : ''}

ÖNEMLI: 3 farklı ton için MUTLAKA ayrı alternatifler üret:

1. **PREMIUM TON**: Lüks, kalite, prestij vurgusu
2. **PRATİK TON**: Günlük kullanım, kolaylık, zaman tasarrufu vurgusu
3. **DEĞER TON**: Fiyat-performans, ekonomik çözüm, tasarruf vurgusu

Her alternatif için gereksinimler:
- **Title**: 50-60 karakter, SEO friendly başlık
- **Meta Description**: 140-160 karakter, click-through oranını artıracak açıklama
- **Long Description**: 200-350 kelime detaylı açıklama
- **Tags**: 8-12 SEO etiketi

SEO Optimizasyon Kuralları:
✓ Anahtar kelimeleri doğal şekilde 3-5 kez kullan
✓ Uzun kuyruk anahtar kelimeler ekle
✓ Kullanıcı sorularına cevap ver (Ne? Nasıl? Neden?)
✓ Satın alma motivasyonu yarat
✓ Teknik özellikleri faydalara çevir
✓ Local SEO için Türkiye pazarına uygun terimler kullan
✓ Call-to-action ifadeleri ekle
✓ Google featured snippet formatında bilgi ver

ZORUNLU JSON FORMAT:
{
  "alternatives": [
    {
      "tone": "Premium",
      "title": "...",
      "metaDescription": "...",
      "longDescription": "...",
      "tags": ["..."]
    },
    {
      "tone": "Pratik", 
      "title": "...",
      "metaDescription": "...",
      "longDescription": "...",
      "tags": ["..."]
    },
    {
      "tone": "Değer",
      "title": "...",
      "metaDescription": "...", 
      "longDescription": "...",
      "tags": ["..."]
    }
  ]
}

Sadece JSON formatında yanıt ver, başka açıklama ekleme.`;

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
      console.log('Ham AI yanıtı:', responseText);
      
      // Eğer JSON parse edilemezse, 3 tonlu yapılandırılmış yanıt oluştur
      const baseDescription = responseText.length > 100 ? responseText.substring(0, 250) + '...' : 
        `${productName} ile yaşam kalitenizi artırın. ${brand ? brand + ' kalitesi' : 'Üstün kalite'} ile tasarlanan bu ürün, ${category || 'ihtiyaçlarınız'}a mükemmel çözüm sunar.`;
      
      const defaultTags = keywords ? 
        keywords.split(',').map(k => k.trim()) : 
        [productName, brand, productModel, category, 'kaliteli', 'uygun fiyat', 'hızlı teslimat', 'güvenilir'].filter(Boolean);

      parsedResult = {
        alternatives: [
          {
            tone: "Premium",
            title: `${productName} - Premium ${brand || 'Kalite'}`,
            metaDescription: `Lüks ${productName} deneyimi. ${brand ? brand + ' prestiji' : 'Üstün kalite'} ile özel tasarım. Hemen keşfedin!`,
            longDescription: `${productName} ile lüks yaşamın ayrıcalığını keşfedin. ${brand ? brand + ' markasının prestijli çizgisinde' : 'Üstün kalitede'} tasarlanan bu ürün, seçkin müşteriler için özel olarak geliştirilmiştir. Her detayında mükemmellik arayışının izlerini görebilirsiniz. ${baseDescription}`,
            tags: [...defaultTags, 'lüks', 'premium', 'kalite', 'prestij']
          },
          {
            tone: "Pratik",
            title: `${productName} - Pratik ve Kullanışlı`,
            metaDescription: `Günlük hayatı kolaylaştıran ${productName}. Pratik çözümler için ideal seçim. Hemen sipariş verin!`,
            longDescription: `Günlük yaşamınızı kolaylaştıracak ${productName} ile tanışın. Pratik tasarımı sayesinde zaman kazanırken, kullanım kolaylığı ile hayatınızı sadeleştirin. ${brand ? brand + ' güvencesi' : 'Güvenilir kalite'} ile üretilen bu ürün, yoğun temponuza uygun çözümler sunar. ${baseDescription}`,
            tags: [...defaultTags, 'pratik', 'kolay kullanım', 'zaman tasarrufu', 'fonksiyonel']
          },
          {
            tone: "Değer",
            title: `${productName} - En Uygun Fiyat`,
            metaDescription: `Uygun fiyatlı ${productName} modelleri. En iyi fiyat-performans oranı. Kaçırmayın!`,
            longDescription: `Bütçenize uygun ${productName} seçenekleri ile kaliteli yaşamın kapılarını aralayın. Fiyat-performans dengesinde mükemmel olan bu ürün, ekonomik çözüm arayanlar için ideal. ${brand ? brand + ' kalitesi' : 'Yüksek kalite'} uygun fiyat avantajı ile birleşiyor. ${baseDescription}`,
            tags: [...defaultTags, 'uygun fiyat', 'ekonomik', 'avantajlı', 'fırsat']
          }
        ]
      };
    }

    // Yanıtı düzenle ve gerekli alanları kontrol et
    if (!parsedResult.alternatives || !Array.isArray(parsedResult.alternatives)) {
      parsedResult = {
        alternatives: [parsedResult]
      };
    }

    // 3 alternatif olduğundan emin ol
    const tones = ['Premium', 'Pratik', 'Değer'];
    while (parsedResult.alternatives.length < 3) {
      const missingIndex = parsedResult.alternatives.length;
      const tone = tones[missingIndex];
      
      parsedResult.alternatives.push({
        tone: tone,
        title: `${productName} - ${tone}`,
        metaDescription: `${productName} için en iyi ${tone.toLowerCase()} çözüm. ${brand ? brand + ' kalitesi' : 'Yüksek kalite'} ile.`,
        longDescription: `Bu ${productName} ${tone.toLowerCase()} arayanlar için özel olarak tasarlandı. ${brand ? brand + ' güvencesi' : 'Güvenilir kalite'} ile üretilen bu ürün, ihtiyaçlarınıza mükemmel yanıt verir. Detaylı inceleme için hemen göz atın.`,
        tags: keywords ? keywords.split(',').map(k => k.trim()) : [productName, brand, productModel, category].filter(Boolean)
      });
    }

    // Her alternatifi kontrol et ve eksik alanları tamamla
    parsedResult.alternatives.forEach((alt, index) => {
      const expectedTone = tones[index] || 'Premium';
      
      if (!alt.tone) alt.tone = expectedTone;
      if (!alt.title || alt.title.length < 10) {
        alt.title = `${productName} - ${expectedTone} ${brand || 'Kalite'}`;
      }
      if (!alt.metaDescription || alt.metaDescription.length < 50) {
        alt.metaDescription = `${productName} için ${expectedTone.toLowerCase()} çözüm. ${brand ? brand + ' kalitesi' : 'Üstün kalite'} ile tasarlandı.`;
      }
      if (!alt.longDescription || alt.longDescription.length < 100) {
        alt.longDescription = `${productName} ile ${expectedTone.toLowerCase()} deneyim yaşayın. ${brand ? brand + ' güvencesiyle' : 'Güvenilir kaliteyle'} üretilen bu ürün, size en uygun çözümü sunar. Detaylı özellikleri keşfetmek ve avantajlarını görmek için hemen inceleyin.`;
      }
      if (!alt.tags || alt.tags.length < 3) {
        const defaultTags = [productName, brand, productModel, category, expectedTone.toLowerCase()].filter(Boolean);
        alt.tags = keywords ? 
          [...keywords.split(',').map(k => k.trim()), ...defaultTags] : 
          defaultTags;
      }
      
      // Karakter sınırlarını kontrol et ve düzenle
      if (alt.title.length > 60) {
        alt.title = alt.title.substring(0, 57) + '...';
      }
      if (alt.metaDescription.length > 160) {
        alt.metaDescription = alt.metaDescription.substring(0, 157) + '...';
      }
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
