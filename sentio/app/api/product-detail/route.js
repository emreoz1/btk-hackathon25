import { NextResponse } from 'next/server';
import reviewsData from '../../../data/reviews.json';
import productsData from '../../../data/products.json';

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
  // Gerçek ürün verisinden fiyatı al
  const product = productsData.find(p => p.productId === productId);
  return product ? product.price : 10000; // Default fiyat
}

function getBrandForProduct(productId) {
  // Gerçek ürün verisinden markayı al
  const product = productsData.find(p => p.productId === productId);
  return product ? product.brand : 'Bilinmeyen';
}

function getCategoryForProduct(productId) {
  // Gerçek ürün verisinden kategoriyi al
  const product = productsData.find(p => p.productId === productId);
  return product ? product.category : 'Genel';
}
