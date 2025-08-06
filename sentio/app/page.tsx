'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import SearchFilters from './components/SearchFilters';

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
}

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInsight, setSearchInsight] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Results */}
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
                  <ProductCard key={`${product.id}-${index}`} product={product} />
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-medium text-gray-900 mb-2">Anlamsal Arama</h3>
                    <p className="text-gray-600">Kesin kelimeler yerine anlam bazlı arama</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-medium text-gray-900 mb-2">AI Önerileri</h3>
                    <p className="text-gray-600">Size en uygun ürünleri önerir</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
