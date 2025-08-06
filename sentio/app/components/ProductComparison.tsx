import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  imageUrl: string;
  averageRating?: number;
  totalReviews?: number;
  sentiment?: string;
}

interface Comparison {
  aiAnalysis: string;
  technicalComparison: any;
  pricePerformanceAnalysis: any[];
  recommendation: any;
}

interface ProductComparisonProps {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onCompare: (productIds: string[], userProfile?: any) => Promise<void>;
  comparisonResult?: {
    comparison: Comparison;
  };
  isLoading: boolean;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({ 
  products, 
  onRemoveProduct, 
  onCompare, 
  comparisonResult,
  isLoading 
}) => {
  const [userProfile, setUserProfile] = useState({
    priorities: '',
    budget: '',
    usage: '',
    experience: ''
  });
  const [showProfileForm, setShowProfileForm] = useState(false);

  const handleCompare = async () => {
    const productIds = products.map(p => p.id);
    const profile = showProfileForm && Object.values(userProfile).some(v => v.trim()) ? userProfile : undefined;
    await onCompare(productIds, profile);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  if (products.length < 2) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-yellow-800">Karşılaştırma için en az 2 ürün seçin</h3>
        <p className="text-yellow-700 mt-2">Arama sonuçlarından ürünleri karşılaştırma listesine ekleyebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seçilen Ürünler */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Karşılaştırılacak Ürünler ({products.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 relative">
                <button
                  onClick={() => onRemoveProduct(product.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
                
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                
                <h3 className="font-medium text-gray-800 mb-2 text-sm">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                <p className="text-lg font-semibold text-blue-600 mb-2">{formatPrice(product.price)}</p>
                
                <div className="flex items-center text-sm">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 text-gray-600">
                    {(product.averageRating || 0).toFixed(1)} ({product.totalReviews || 0} yorum)
                  </span>
                </div>
                
                <div className="mt-2">
                  <span className={`text-xs font-medium ${getSentimentColor(product.sentiment || 'neutral')}`}>
                    {product.sentiment === 'positive' ? 'Pozitif' : 
                     product.sentiment === 'negative' ? 'Negatif' : 'Nötr'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kullanıcı Profili Formu */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Kişiselleştirilmiş Karşılaştırma</h3>
            <button
              onClick={() => setShowProfileForm(!showProfileForm)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showProfileForm ? 'Gizle' : 'Profil Ekle'}
            </button>
          </div>
          
          {showProfileForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Öncelikleriniz (ör: fiyat, performans, tasarım)
                </label>
                <input
                  type="text"
                  value={userProfile.priorities}
                  onChange={(e) => setUserProfile({...userProfile, priorities: e.target.value})}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="En önem verdiğiniz özellikler..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bütçeniz
                </label>
                <input
                  type="text"
                  value={userProfile.budget}
                  onChange={(e) => setUserProfile({...userProfile, budget: e.target.value})}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Bütçe aralığınız..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanım Amacı
                </label>
                <input
                  type="text"
                  value={userProfile.usage}
                  onChange={(e) => setUserProfile({...userProfile, usage: e.target.value})}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Nasıl kullanacaksınız?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deneyim Seviyeniz
                </label>
                <select
                  value={userProfile.experience}
                  onChange={(e) => setUserProfile({...userProfile, experience: e.target.value})}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="beginner">Başlangıç</option>
                  <option value="intermediate">Orta</option>
                  <option value="advanced">İleri</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Karşılaştırma Butonu */}
        <div className="p-6">
          <button
            onClick={handleCompare}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Karşılaştırılıyor...' : `${products.length} Ürünü Karşılaştır`}
          </button>
        </div>
      </div>

      {/* Karşılaştırma Sonuçları */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* AI Analizi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Akıllı Karşılaştırma Analizi
            </h3>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {comparisonResult.comparison.aiAnalysis}
              </div>
            </div>
          </div>

          {/* Fiyat-Performans Analizi */}
          {comparisonResult.comparison.pricePerformanceAnalysis && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Fiyat-Performans Analizi
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        F/P Skoru
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comparisonResult.comparison.pricePerformanceAnalysis.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.rating.toFixed(1)}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.pricePerformanceScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.category === 'Mükemmel' ? 'bg-green-100 text-green-800' :
                            item.category === 'İyi' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'Orta' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Öneriler */}
          {comparisonResult.comparison.recommendation && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Önerilerimiz
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">En Yüksek Puan</h4>
                  <p className="text-sm text-green-700 mb-2">
                    {comparisonResult.comparison.recommendation.highestRated.product.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {comparisonResult.comparison.recommendation.highestRated.reason}
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">En Ekonomik</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    {comparisonResult.comparison.recommendation.bestValue.product.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    {comparisonResult.comparison.recommendation.bestValue.reason}
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Dengeli Seçim</h4>
                  <p className="text-sm text-purple-700 mb-2">
                    {comparisonResult.comparison.recommendation.balanced.product.name}
                  </p>
                  <p className="text-xs text-purple-600">
                    {comparisonResult.comparison.recommendation.balanced.reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductComparison;
