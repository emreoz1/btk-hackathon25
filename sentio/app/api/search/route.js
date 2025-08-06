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

    // Sorguyu analiz et ve akıllı filtreleme yap
    const queryLower = query.toLowerCase();
    const detectedFilters = {};
    
    // Marka tespiti
    const brands = ['apple', 'samsung', 'sony', 'xiaomi', 'dell', 'dyson'];
    const detectedBrand = brands.find(brand => queryLower.includes(brand));
    
    // Marka adını doğru formatta ayarla
    let brandName = null;
    if (detectedBrand) {
      const brandMap = {
        'apple': 'Apple',
        'samsung': 'Samsung', 
        'sony': 'Sony',
        'xiaomi': 'Xiaomi',
        'dell': 'Dell',
        'dyson': 'Dyson'
      };
      brandName = brandMap[detectedBrand];
    }
    
    // Kategori tespiti
    const categoryMap = {
      // Telefon kategorisi
      'iphone': 'Telefon',
      'telefon': 'Telefon',
      'phone': 'Telefon',
      'samsung galaxy': 'Telefon',
      'galaxy': 'Telefon',
      'xiaomi': 'Telefon',
      'huawei': 'Telefon',
      'oppo': 'Telefon',
      'vivo': 'Telefon',
      
      // Laptop kategorisi
      'laptop': 'Laptop',
      'macbook': 'Laptop',
      'notebook': 'Laptop',
      'dell xps': 'Laptop',
      'lenovo': 'Laptop',
      'asus': 'Laptop',
      'hp': 'Laptop',
      'acer': 'Laptop',
      'thinkpad': 'Laptop',
      
      // Kulaklık kategorisi
      'kulaklık': 'Kulaklık',
      'kulaklik': 'Kulaklık',
      'headphone': 'Kulaklık',
      'airpods': 'Kulaklık',
      'sony wh': 'Kulaklık',
      'beats': 'Kulaklık',
      'bose': 'Kulaklık',
      'jbl': 'Kulaklık',
      
      // Ev Elektroniği
      'süpürge': 'Ev Elektroniği',
      'supurge': 'Ev Elektroniği',
      'robot süpürge': 'Ev Elektroniği',
      'robot supurge': 'Ev Elektroniği',
      'dyson': 'Ev Elektroniği',
      'xiaomi robot': 'Ev Elektroniği',
      'elektrikli süpürge': 'Ev Elektroniği',
      'şarjlı süpürge': 'Ev Elektroniği',
      
      // Oyun Konsolu
      'playstation': 'Oyun Konsolu',
      'ps5': 'Oyun Konsolu',
      'ps4': 'Oyun Konsolu',
      'xbox': 'Oyun Konsolu',
      'nintendo': 'Oyun Konsolu',
      'oyun konsolu': 'Oyun Konsolu',
      'gaming console': 'Oyun Konsolu',
      
      // TV
      'tv': 'TV',
      'televizyon': 'TV',
      'oled': 'TV',
      'smart tv': 'TV',
      'lg oled': 'TV',
      'samsung tv': 'TV',
      'sony tv': 'TV',
      'tcl': 'TV',
      
      // Beyaz Eşya
      'buzdolabı': 'Beyaz Eşya',
      'buzdolabi': 'Beyaz Eşya',
      'çamaşır makinesi': 'Beyaz Eşya',
      'camasir makinesi': 'Beyaz Eşya',
      'bulaşık makinesi': 'Beyaz Eşya',
      'bulasik makinesi': 'Beyaz Eşya',
      'beyaz eşya': 'Beyaz Eşya',
      'fridge': 'Beyaz Eşya',
      'arçelik': 'Beyaz Eşya',
      'bosch': 'Beyaz Eşya',
      'siemens': 'Beyaz Eşya',
      
      // Kamera
      'kamera': 'Kamera',
      'canon': 'Kamera',
      'nikon': 'Kamera',
      'sony alpha': 'Kamera',
      'fotoğraf makinesi': 'Kamera',
      'fotograf makinesi': 'Kamera',
      'dslr': 'Kamera',
      'mirrorless': 'Kamera',
      
      // Elektrikli Araç
      'tesla': 'Elektrikli Araç',
      'elektrikli araç': 'Elektrikli Araç',
      'elektrikli araba': 'Elektrikli Araç',
      'electric car': 'Elektrikli Araç',
      'model y': 'Elektrikli Araç',
      'model 3': 'Elektrikli Araç',
      'bmw i3': 'Elektrikli Araç',
      'nissan leaf': 'Elektrikli Araç',
      
      // Akıllı Ev
      'akıllı ev': 'Akıllı Ev',
      'akilli ev': 'Akıllı Ev',
      'smart home': 'Akıllı Ev',
      'philips hue': 'Akıllı Ev',
      'ampul': 'Akıllı Ev',
      'akıllı anahtar': 'Akıllı Ev',
      'sensör': 'Akıllı Ev',
      'alexa': 'Akıllı Ev',
      'google nest': 'Akıllı Ev',
      
      // Bilgisayar Parçası
      'ekran kartı': 'Bilgisayar Parçası',
      'ekran karti': 'Bilgisayar Parçası',
      'graphics card': 'Bilgisayar Parçası',
      'rtx': 'Bilgisayar Parçası',
      'gtx': 'Bilgisayar Parçası',
      'asus rog': 'Bilgisayar Parçası',
      'nvidia': 'Bilgisayar Parçası',
      'amd': 'Bilgisayar Parçası',
      'işlemci': 'Bilgisayar Parçası',
      'islemci': 'Bilgisayar Parçası',
      'ram': 'Bilgisayar Parçası',
      'ssd': 'Bilgisayar Parçası',
      'anakart': 'Bilgisayar Parçası',
      
      // Akıllı Saat
      'akıllı saat': 'Akıllı Saat',
      'akilli saat': 'Akıllı Saat',
      'smartwatch': 'Akıllı Saat',
      'galaxy watch': 'Akıllı Saat',
      'apple watch': 'Akıllı Saat',
      'fitbit': 'Akıllı Saat',
      'garmin': 'Akıllı Saat',
      'huawei watch': 'Akıllı Saat',
      
      // Tablet
      'tablet': 'Tablet',
      'ipad': 'Tablet',
      'surface pro': 'Tablet',
      'samsung tablet': 'Tablet',
      'galaxy tab': 'Tablet',
      'lenovo tab': 'Tablet',
      
      // Diğer kategoriler
      'kitap': 'Kitap',
      'book': 'Kitap',
      'roman': 'Kitap',
      'dergi': 'Kitap',
      
      'oyuncak': 'Oyuncak',
      'toy': 'Oyuncak',
      'lego': 'Oyuncak',
      'bebek oyuncak': 'Oyuncak',
      
      'kozmetik': 'Kozmetik',
      'makyaj': 'Kozmetik',
      'parfüm': 'Kozmetik',
      'krem': 'Kozmetik',
      'şampuan': 'Kozmetik',
      
      'giyim': 'Giyim',
      'clothing': 'Giyim',
      'tişört': 'Giyim',
      'pantolon': 'Giyim',
      'elbise': 'Giyim',
      'ayakkabı': 'Giyim',
      
      'mutfak': 'Mutfak Aleti',
      'blender': 'Mutfak Aleti',
      'mikser': 'Mutfak Aleti',
      'kahve makinesi': 'Mutfak Aleti',
      'tost makinesi': 'Mutfak Aleti',
      'fritöz': 'Mutfak Aleti',
      
      'takı': 'Takı',
      'jewelry': 'Takı',
      'kolye': 'Takı',
      'küpe': 'Takı',
      'yüzük': 'Takı',
      'bilezik': 'Takı',
      
      'anne bebek': 'Anne & Bebek',
      'bebek': 'Anne & Bebek',
      'mama': 'Anne & Bebek',
      'bez': 'Anne & Bebek',
      'emzik': 'Anne & Bebek'
    };
    
    const detectedCategory = Object.keys(categoryMap).find(keyword => 
      queryLower.includes(keyword)
    );
    
    if (detectedCategory) {
      detectedFilters.category = categoryMap[detectedCategory];
    }
    
    if (brandName) {
      detectedFilters.brand = brandName;
    }
    
    console.log('🎯 Tespit edilen filtreler:', detectedFilters);

    // Gemini ile sorguyu vektöre çevir
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await model.embedContent(query);
    const searchVector = embeddingResult.embedding.values;

    // Pinecone filtreleri oluştur
    let filter = { type: 'product' };
    
    // Kullanıcı tarafından belirtilen filtreler
    if (category && category !== 'all') {
      filter.category = category;
      console.log('👤 Manuel kategori seçildi:', category);
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price['$gte'] = minPrice;
      if (maxPrice) filter.price['$lte'] = maxPrice;
    }
    
    // Akıllı tespit edilen filtreler - sadece manuel filtre yoksa uygula
    if (!filter.category && detectedFilters.category) {
      filter.category = detectedFilters.category;
      console.log('🎯 Kategori otomatik tespit edildi:', detectedFilters.category);
    }
    
    // Marka filtresi her zaman uygulanabilir (kategori ile çakışmaz)
    if (detectedFilters.brand) {
      filter.brand = detectedFilters.brand;
      console.log('🎯 Marka otomatik tespit edildi:', detectedFilters.brand);
    }
    
    console.log('🔧 Kullanılacak filtreler:', filter);

    // Pinecone'da anlamsal arama yap
    const index = pinecone.index('sentio-main-index');
    const searchResults = await index.query({
      topK: 20, // İlk 20 sonucu getir
      vector: searchVector,
      includeMetadata: true,
      filter: filter
    });

    console.log('📊 Bulunan sonuç sayısı:', searchResults.matches.length);
    console.log('🎯 İlk 3 sonuç skorları:', searchResults.matches.slice(0, 3).map(m => ({ name: m.metadata?.name, score: m.score })));

    // Minimum benzerlik skorunu belirle (daha yüksek threshold)
    let relevantResults = searchResults.matches.filter(match => match.score > 0.5);
    
    console.log('✅ Yüksek skor threshold sonrası:', relevantResults.length);

    // Eğer çok az sonuç varsa threshold'ı düşür
    if (relevantResults.length < 3) {
      relevantResults = searchResults.matches.filter(match => match.score > 0.3);
      console.log('📉 Düşük threshold ile sonuç sayısı:', relevantResults.length);
    }

    // Marka ve kategori bazlı ek filtreleme
    if (detectedFilters.brand || detectedFilters.category) {
      console.log('🔍 Ek anlamsal filtreleme uygulanıyor...');
      
      relevantResults = relevantResults.filter(match => {
        let brandMatch = true;
        let categoryMatch = true;
        
        // Marka kontrolü
        if (detectedFilters.brand) {
          const productBrand = match.metadata?.brand?.toLowerCase() || '';
          const searchBrand = detectedFilters.brand.toLowerCase();
          brandMatch = productBrand.includes(searchBrand) || searchBrand.includes(productBrand);
        }
        
        // Kategori kontrolü (manual kategori filtresi varsa ona öncelik ver)
        if (!category || category === 'all') {
          if (detectedFilters.category) {
            categoryMatch = match.metadata?.category === detectedFilters.category;
          }
        }
        
        return brandMatch && categoryMatch;
      });
      
      console.log('🎯 Anlamsal filtreleme sonrası:', relevantResults.length);
    }

    // İsim ve açıklama bazlı ek akıllı filtreleme
    if (query && relevantResults.length > 0) {
      const queryWords = queryLower.split(' ').filter(word => word.length > 2);
      
      // Manuel kategori çakışması varsa kelime eşleşmesi daha katı olsun
      const hasManualCategoryFilter = category && category !== 'all';
      const queryConflictsWithCategory = hasManualCategoryFilter && detectedFilters.category && 
        detectedFilters.category !== category;
      
      const wordMatchThreshold = queryConflictsWithCategory ? 0.3 : 0.1; // Çakışma varsa daha yüksek threshold
      const scoreThreshold = queryConflictsWithCategory ? 0.7 : 0.6;
      
      console.log('📝 Kelime eşleşme parametreleri:', { 
        wordMatchThreshold, 
        scoreThreshold, 
        queryConflictsWithCategory,
        manualCategory: category,
        detectedCategory: detectedFilters.category
      });
      
      relevantResults = relevantResults.map(match => {
        const productName = match.metadata?.name?.toLowerCase() || '';
        const productDesc = match.metadata?.description?.toLowerCase() || '';
        const productText = `${productName} ${productDesc}`;
        
        // Sorgu kelimelerinin ürün metninde geçme oranını hesapla
        const matchingWords = queryWords.filter(word => 
          productText.includes(word) || 
          productText.includes(word.replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c'))
        );
        
        const wordMatchRatio = matchingWords.length / queryWords.length;
        
        // Skor ve kelime eşleşme oranını birleştir
        const combinedScore = (match.score * 0.7) + (wordMatchRatio * 0.3);
        
        return {
          ...match,
          combinedScore,
          wordMatchRatio
        };
      })
      .filter(match => match.wordMatchRatio > wordMatchThreshold || match.score > scoreThreshold)
      .sort((a, b) => b.combinedScore - a.combinedScore);
      
      console.log('📝 Kelime eşleşme filtresi sonrası:', relevantResults.length);
    }

    // Sonuçları formatla ve skora göre sırala
    let products = relevantResults.map(match => ({
      id: match.metadata.productId,
      name: match.metadata.name,
      description: match.metadata.description,
      price: match.metadata.price,
      category: match.metadata.category,
      brand: match.metadata.brand,
      imageUrl: match.metadata.imageUrl,
      features: match.metadata.features,
      score: match.combinedScore || match.score,
      relevance: Math.round((match.combinedScore || match.score) * 100),
      wordMatchRatio: match.wordMatchRatio || 0
    }));

    // Eğer hiç sonuç yoksa, fallback uygulama kararı ver
    if (products.length === 0 && searchResults.matches.length > 0) {
      console.log('⚠️ Hiç sonuç yok, fallback uygulanıp uygulanmayacağı kontrol ediliyor...');
      
      // Manuel kategori seçildiyse ve sorgu ile uyuşmuyorsa fallback YAPMA
      const hasManualCategoryFilter = category && category !== 'all';
      const queryConflictsWithCategory = hasManualCategoryFilter && detectedFilters.category && 
        detectedFilters.category !== category;
      
      if (queryConflictsWithCategory) {
        console.log('❌ Kategori çakışması tespit edildi:', {
          manuelKategori: category,
          tespiEdilenKategori: detectedFilters.category,
          sorgu: query
        });
        console.log('🚫 Fallback uygulanmayacak - mantıksız sonuçlar döndürmek yerine boş liste döndürülüyor');
        products = [];
      } else {
        // Sadece skor problemi varsa fallback uygula
        console.log('📉 Sadece skor düşük, fallback uygulanıyor...');
        const fallbackResults = searchResults.matches
          .filter(match => match.score > 0.15)
          .slice(0, 5);
          
        products = fallbackResults.map(match => ({
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
      }
    }

    // Sonuçları en fazla 12 ile sınırla
    products = products.slice(0, 12);

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
    } else {
      // Sonuç bulunamadığında nedeni analiz et
      const hasManualCategoryFilter = category && category !== 'all';
      const queryConflictsWithCategory = hasManualCategoryFilter && detectedFilters.category && 
        detectedFilters.category !== category;
      
      if (queryConflictsWithCategory) {
        searchInsight = `"${query}" sorgunuz "${detectedFilters.category}" kategorisine ait görünüyor, ancak "${category}" kategorisinde arama yaptınız. Kategori filtresini "${detectedFilters.category}" olarak değiştirmeyi deneyin.`;
      } else if (hasManualCategoryFilter) {
        searchInsight = `"${query}" aramanız için "${category}" kategorisinde uygun ürün bulunamadı. Kategori filtresini kaldırarak tüm kategorilerde arama yapmayı deneyin.`;
      } else {
        searchInsight = `"${query}" aramanız için uygun ürün bulunamadı. Farklı kelimeler kullanarak tekrar deneyebilir veya kategorilerden seçim yapabilirsiniz.`;
      }
    }

    return NextResponse.json({
      query,
      products,
      totalResults: products.length,
      searchInsight,
      filters: { category, minPrice, maxPrice },
      debug: {
        detectedFilters,
        appliedFilters: filter,
        originalResults: searchResults.matches.length,
        hasConflict: category && category !== 'all' && detectedFilters.category && 
          detectedFilters.category !== category
      }
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
