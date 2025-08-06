'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import SearchFilters from './components/SearchFilters';
import ProductAnalysis from './components/ProductAnalysis';
import ProductComparison from './components/ProductComparison';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  imageUrl: string;
  features: string[];
  relevance?: number;
  averageRating?: number;
  totalReviews?: number;
  sentiment?: string;
}

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface Analysis {
  pros: string[];
  cons: string[];
  overallSentiment: 'positive' | 'negative' | 'neutral';
  userSatisfactionScore: number;
  summary: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInsight, setSearchInsight] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Faz 2: Yeni state'ler
  const [activeTab, setActiveTab] = useState<'search' | 'analysis' | 'compare' | 'vision'>('search');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analyzedProductName, setAnalyzedProductName] = useState('');
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  
  // Faz 3: Vision state'leri
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionDescription, setVisionDescription] = useState('');
  const [visionSearchQuery, setVisionSearchQuery] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleSearch = async (query: string, filters: SearchFilters = {}) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, ...filters }),
      });

      if (!response.ok) {
        throw new Error('Arama işlemi başarısız');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setSearchInsight(data.searchInsight || '');
      
    } catch (error) {
      console.error('Arama hatası:', error);
      setProducts([]);
      setSearchInsight('');
    } finally {
      setLoading(false);
    }
  };

  // Faz 2: Yorum analizi fonksiyonu
  const handleAnalyze = async (productId: string, productName: string) => {
    setAnalysisLoading(true);
    setAnalyzedProductName(productName);
    setActiveTab('analysis');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Analiz işlemi başarısız');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
    } catch (error) {
      console.error('Analiz hatası:', error);
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Faz 2: Karşılaştırma listesine ürün ekleme
  const handleAddToComparison = (product: Product) => {
    if (comparisonProducts.length < 5 && !comparisonProducts.find(p => p.id === product.id)) {
      const comparisonProduct = {
        ...product,
        averageRating: product.averageRating || 0,
        totalReviews: product.totalReviews || 0,
        sentiment: product.sentiment || 'neutral'
      };
      setComparisonProducts([...comparisonProducts, comparisonProduct]);
      
      // Eğer 2 ürün varsa karşılaştırma sekmesine geç
      if (comparisonProducts.length === 1) {
        setActiveTab('compare');
      }
    }
  };

  // Faz 2: Karşılaştırma listesinden ürün çıkarma
  const handleRemoveFromComparison = (productId: string) => {
    setComparisonProducts(comparisonProducts.filter(p => p.id !== productId));
    setComparisonResult(null);
  };

  // Faz 2: Ürün karşılaştırma fonksiyonu
  const handleCompare = async (productIds: string[], userProfile?: any) => {
    setComparisonLoading(true);
    
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productIds, 
          userProfile,
          comparisonType: 'general'
        }),
      });

      if (!response.ok) {
        throw new Error('Karşılaştırma işlemi başarısız');
      }

      const data = await response.json();
      setComparisonResult(data);
      
    } catch (error) {
      console.error('Karşılaştırma hatası:', error);
      setComparisonResult(null);
    } finally {
      setComparisonLoading(false);
    }
  };

  // Faz 3: Görsel analizi fonksiyonu
  const handleVisionAnalysis = async (file: File) => {
    setVisionLoading(true);
    setUploadedImage(URL.createObjectURL(file));
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/vision', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Görsel analizi başarısız');
      }

      const data = await response.json();
      setVisionDescription(data.originalDescription);
      setVisionSearchQuery(data.searchQuery);
      
      // Otomatik olarak arama yap
      if (data.searchQuery) {
        await handleSearch(data.searchQuery);
      }
      
    } catch (error) {
      console.error('Vision analizi hatası:', error);
      setVisionDescription('');
      setVisionSearchQuery('');
    } finally {
      setVisionLoading(false);
    }
  };

  // Faz 3: Görsel temizleme
  const handleClearVision = () => {
    setUploadedImage(null);
    setVisionDescription('');
    setVisionSearchQuery('');
    setProducts([]);
    setSearchInsight('');
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <span className="text-blue-600">Sentio</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Akıllı ürün arama ve fiyat karşılaştırma platformu
            </p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Arama ({products.length})
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analiz
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'compare'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Karşılaştır ({comparisonProducts.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'vision'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Görsel Arama
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            {/* Search Section */}
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} loading={loading} />
            </div>

            {/* Filters */}
            {hasSearched && (
              <div className="mb-6">
                <SearchFilters onFilterChange={handleSearch} />
              </div>
            )}

            {/* Search Insight */}
            {searchInsight && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">AI Önerisi</h3>
                    <p className="mt-1 text-sm text-blue-700">{searchInsight}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            <div>
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600">Aranıyor...</span>
                  </div>
                </div>
              )}

              {!loading && hasSearched && products.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sonuç bulunamadı</h3>
                  <p className="text-gray-500">Farklı anahtar kelimelerle tekrar deneyebilirsiniz.</p>
                </div>
              )}

              {!loading && products.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {products.length} ürün bulundu
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                      <ProductCard 
                        key={`${product.id}-${index}`} 
                        product={product}
                        onAnalyze={handleAnalyze}
                        onAddToComparison={handleAddToComparison}
                        isInComparison={comparisonProducts.some(p => p.id === product.id)}
                      />
                    ))}
                  </div>
                </>
              )}

              {!hasSearched && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Akıllı ürün araması
                    </h2>
                    <p className="text-gray-600 mb-8">
                      İstediğiniz ürünü doğal dille tarif edin. Örnek: &quot;Sessiz çalışan, evcil hayvan tüylerini iyi çeken robot süpürge&quot;
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-medium text-gray-900 mb-2">Anlamsal Arama</h3>
                        <p className="text-gray-600">Kesin kelimeler yerine anlam bazlı arama</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-medium text-gray-900 mb-2">Yorum Analizi</h3>
                        <p className="text-gray-600">AI ile kullanıcı yorumlarını analiz eder</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-medium text-gray-900 mb-2">Akıllı Karşılaştırma</h3>
                        <p className="text-gray-600">Ürünleri detaylı olarak karşılaştırır</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div>
            <ProductAnalysis 
              analysis={analysis || undefined} 
              productName={analyzedProductName}
              isLoading={analysisLoading}
            />
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'compare' && (
          <div>
            <ProductComparison
              products={comparisonProducts}
              onRemoveProduct={handleRemoveFromComparison}
              onCompare={handleCompare}
              comparisonResult={comparisonResult}
              isLoading={comparisonLoading}
            />
          </div>
        )}

        {/* Vision Tab - Faz 3 */}
        {activeTab === 'vision' && (
          <div className="space-y-8">
            {/* Vision Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Görselle Ürün Arama</h2>
                <p className="text-gray-600 mb-6">
                  Bir ürün fotoğrafı yükleyin, AI teknolojisi ile analiz edip benzer ürünleri bulalım
                </p>
                
                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleVisionAnalysis(file);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                      disabled={visionLoading}
                    />
                    <label 
                      htmlFor="image-upload" 
                      className={`cursor-pointer inline-flex flex-col items-center ${
                        visionLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-lg font-medium text-gray-900 mb-1">
                        {visionLoading ? 'Analiz ediliyor...' : 'Görsel Yükle'}
                      </span>
                      <span className="text-sm text-gray-500">
                        PNG, JPG, WebP formatları desteklenir (Max 10MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img 
                        src={uploadedImage} 
                        alt="Yüklenen görsel" 
                        className="max-w-md max-h-64 object-contain rounded-lg shadow-sm"
                      />
                    </div>
                    <button
                      onClick={handleClearVision}
                      className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700 border border-orange-300 rounded-lg hover:border-orange-400 transition-colors"
                    >
                      Yeni Görsel Yükle
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Vision Analysis Results */}
            {visionDescription && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">AI Görsel Analizi</h3>
                    <p className="mt-1 text-sm text-orange-700">{visionDescription}</p>
                    {visionSearchQuery && (
                      <p className="mt-2 text-xs text-orange-600">
                        <strong>Arama Sorgusu:</strong> "{visionSearchQuery}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results from Vision */}
            {hasSearched && visionSearchQuery && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Görsele Benzer Ürünler ({products.length})
                </h3>
                
                {searchInsight && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">AI Önerisi</h3>
                        <p className="mt-1 text-sm text-blue-700">{searchInsight}</p>
                      </div>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    <span className="ml-3 text-gray-600">Ürünler aranıyor...</span>
                  </div>
                ) : (
                  <>
                    {products.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Sonuç Bulunamadı</h3>
                          <p>Bu görsele benzer ürün bulunamadı. Farklı bir görsel deneyin.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, index) => (
                          <ProductCard
                            key={`${product.id}-${index}`}
                            product={product}
                            onAnalyze={handleAnalyze}
                            onAddToComparison={handleAddToComparison}
                            isInComparison={comparisonProducts.some(p => p.id === product.id)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 Sentio - Akıllı Ürün Keşif Platformu</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
