'use client';

import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  imageUrl: string;
  features: string[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

interface Store {
  name: string;
  price: number;
  inStock: boolean;
  url: string;
}

interface ProductDetails {
  reviews: Review[];
  stores: Store[];
  specifications: { [key: string]: string };
}

interface ProductDetailProps {
  product: Product;
  details: ProductDetails | null;
  loading: boolean;
  onBack: () => void;
}

export default function ProductDetail({ product, details, loading, onBack }: ProductDetailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const cheapestStore = details?.stores.filter(store => store.inStock).reduce((prev, current) => {
    return (prev.price < current.price) ? prev : current;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Geri Dön Butonu */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Arama sonuçlarına dön
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Ürün detayları yükleniyor...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Taraf - Ürün Görseli */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/500x500?text=Ürün+Görseli';
                }}
              />
            </div>
          </div>

          {/* Sağ Taraf - Ürün Bilgileri */}
          <div className="space-y-6">
            {/* Ürün Başlığı ve Fiyat */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-xl text-blue-600 font-semibold">{formatPrice(product.price)}</p>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            {/* Özellikler */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Özellikler</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Teknik Özellikler */}
            {details?.specifications && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Teknik Özellikler</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(details.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="font-medium text-gray-700">{key}:</dt>
                        <dd className="text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alt Kısım - Mağazalar ve Yorumlar */}
      {!loading && details && (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mağazalar */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Satın Alabileceğiniz Mağazalar</h3>
            <div className="space-y-3">
              {details.stores.map((store, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    store === cheapestStore ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900">{store.name}</span>
                      {store === cheapestStore && (
                        <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                          En Ucuz
                        </span>
                      )}
                      {!store.inStock && (
                        <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          Stokta Yok
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(store.price)}
                      </div>
                      {store.inStock && (
                        <button className="mt-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                          Mağazaya Git
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yorumlar */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Kullanıcı Yorumları</h3>
            <div className="space-y-4">
              {details.reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{review.author}</span>
                      <div className="flex ml-2">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
