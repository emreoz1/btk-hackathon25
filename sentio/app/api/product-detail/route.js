import { NextResponse } from 'next/server';
import reviewsData from '../../../data/reviews.json';

export async function POST(request) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🔍 Ürün detayı isteniyor:', productId);

    // İlgili ürünün yorumlarını filtrele
    const productReviews = reviewsData.filter(review => review.productId === productId);
    
    console.log(`📝 Bulunan yorum sayısı: ${productReviews.length}`);

    // Yorumları uygun formata dönüştür
    const reviews = productReviews.map(review => ({
      id: parseInt(review.reviewId),
      rating: review.rating,
      comment: review.comment,
      author: review.author, // JSON'dan gelen gerçek yazar ismi
      date: new Date(review.date).toLocaleDateString('tr-TR')
    }));

    // Mock mağaza verilerini oluştur
    // Ürün fiyatını base alarak diğer mağazalara rastgele fiyatlar ver
    const basePrice = getBasePriceForProduct(productId);
    
    // Rastgele mağaza fiyatları oluştur (base fiyattan daha yüksek)
    const stores = [
      { 
        name: "Teknosa", 
        price: Math.round(basePrice * (1.02 + Math.random() * 0.08)), 
        inStock: true, 
        url: "#" 
      },
      { 
        name: "Vatan Bilgisayar", 
        price: Math.round(basePrice * (1.05 + Math.random() * 0.1)), 
        inStock: true, 
        url: "#" 
      },
      { 
        name: "Hepsiburada", 
        price: Math.round(basePrice * (1.03 + Math.random() * 0.12)), 
        inStock: true, 
        url: "#" 
      },
      { 
        name: "Trendyol", 
        price: Math.round(basePrice * (1.04 + Math.random() * 0.15)), 
        inStock: Math.random() > 0.2, // %80 stokta olma şansı
        url: "#" 
      },
      { 
        name: "Amazon", 
        price: Math.round(basePrice * (1.01 + Math.random() * 0.18)), 
        inStock: Math.random() > 0.1, // %90 stokta olma şansı
        url: "#" 
      }
    ];

    // En düşük fiyatı bulup rastgele bir mağazaya ata
    let minPrice = Math.min(...stores.map(store => store.price));
    
    // Base fiyatın kendisini en düşük fiyat yap
    minPrice = basePrice;
    
    // Rastgele bir mağazayı seç ve ona en düşük fiyatı ver
    const randomStoreIndex = Math.floor(Math.random() * stores.length);
    stores[randomStoreIndex].price = minPrice;

    const productDetails = {
      reviews,
      stores,
      specifications: {
        "Marka": getBrandForProduct(productId),
        "Kategori": getCategoryForProduct(productId),
        "Garanti": "2 Yıl",
        "Kargo": "Ücretsiz",
        "İade": "14 Gün",
        "Ürün Kodu": `PRD-${productId.padStart(6, '0')}`
      }
    };

    return NextResponse.json(productDetails);

  } catch (error) {
    console.error('❌ Ürün detay hatası:', error);
    return NextResponse.json(
      { error: 'Ürün detayları alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

// Yardımcı fonksiyonlar
function getBasePriceForProduct(productId) {
  // Gerçek projede bu ürün veritabanından gelecek
  const priceMap = {
    '1': 85999,   // iPhone 15 Pro Max
    '2': 79999,   // Samsung Galaxy S24 Ultra
    '3': 12999,   // Sony WH-1000XM5
    '4': 45999,   // MacBook Air M3
    '5': 24999,   // Dyson V15 Detect
    '6': 18999,   // AirPods Pro 2
    '7': 89999,   // ASUS ROG Strix
    '8': 8999,    // Xiaomi Robot Vacuum
    '9': 21999,   // PlayStation 5
    '10': 52999,  // LG OLED TV
    '11': 35999,  // Bosch Buzdolabı
    '12': 67999,  // Canon EOS R6 Mark II
    '13': 1599999, // Tesla Model Y
    '14': 2999,   // Philips Hue
    '15': 89999,  // Nikon Z7 II
    '16': 43999,  // NVIDIA RTX 4080
    '17': 12999,  // Galaxy Watch 6 Classic
    '18': 54999,  // iPad Pro M2
    '19': 18999,  // Bosch Çamaşır Makinesi
    '20': 67999   // Surface Pro 9
  };
  
  return priceMap[productId] || 10000; // Default fiyat
}

function getBrandForProduct(productId) {
  const brandMap = {
    '1': 'Apple',
    '2': 'Samsung',
    '3': 'Sony', 
    '4': 'Apple',
    '5': 'Dyson',
    '6': 'Apple',
    '7': 'ASUS',
    '8': 'Xiaomi',
    '9': 'Sony',
    '10': 'LG',
    '11': 'Bosch',
    '12': 'Canon',
    '13': 'Tesla',
    '14': 'Philips',
    '15': 'Nikon',
    '16': 'NVIDIA',
    '17': 'Samsung',
    '18': 'Apple',
    '19': 'Bosch',
    '20': 'Microsoft'
  };
  
  return brandMap[productId] || 'Bilinmeyen';
}

function getCategoryForProduct(productId) {
  const categoryMap = {
    '1': 'Telefon',
    '2': 'Telefon',
    '3': 'Kulaklık',
    '4': 'Laptop',
    '5': 'Ev Elektroniği',
    '6': 'Kulaklık',
    '7': 'Laptop',
    '8': 'Ev Elektroniği',
    '9': 'Oyun Konsolu',
    '10': 'Televizyon',
    '11': 'Beyaz Eşya',
    '12': 'Fotoğraf Makinesi',
    '13': 'Otomobil',
    '14': 'Akıllı Ev',
    '15': 'Fotoğraf Makinesi',
    '16': 'Bilgisayar Parçası',
    '17': 'Akıllı Saat',
    '18': 'Tablet',
    '19': 'Beyaz Eşya',
    '20': 'Tablet'
  };
  
  return categoryMap[productId] || 'Genel';
}
