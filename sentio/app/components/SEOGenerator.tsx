'use client';

import { useState } from 'react';

interface SEODescription {
  tone: string;
  title: string;
  metaDescription: string;
  longDescription: string;
  tags: string[];
}

interface SEOGeneratorProps {
  descriptions: SEODescription[];
  isLoading: boolean;
  onGenerate: (data: any) => void;
}

export default function SEOGenerator({ descriptions, isLoading, onGenerate }: SEOGeneratorProps) {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      productName,
      brand,
      model,
      keywords,
      category
    });
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  const categories = [
    { value: '', label: 'Kategori Seçin' },
    { value: 'elektronik', label: 'Elektronik' },
    { value: 'giyim', label: 'Giyim & Aksesuar' },
    { value: 'ev-yasam', label: 'Ev & Yaşam' },
    { value: 'kozmetik', label: 'Kozmetik & Kişisel Bakım' },
    { value: 'spor', label: 'Spor & Outdoor' },
    { value: 'kitap', label: 'Kitap & Müzik' },
    { value: 'oyuncak', label: 'Oyuncak & Hobi' },
    { value: 'otomotiv', label: 'Otomotiv & Motosiklet' },
    { value: 'diger', label: 'Diğer' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">SEO Açıklama Üretici</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ürün bilgilerinizi girin ve AI teknolojisi ile SEO optimized, satış odaklı ürün açıklamaları ürettin. 
          3 farklı ton seçeneği ile profesyonel açıklamalar elde edin.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ürün Adı */}
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Örn: Samsung Galaxy S25"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={isLoading}
              />
            </div>

            {/* Marka */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Marka
              </label>
              <input
                type="text"
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Örn: Samsung"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Örn: SM-S928B"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
            </div>

            {/* Kategori */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Anahtar Kelimeler */}
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Anahtar Kelimeler
            </label>
            <textarea
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              rows={3}
              placeholder="Örn: 200MP kamera, titanyum kasa, 5G, uzun batarya ömrü (virgülle ayırın)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ürününüzün öne çıkan özelliklerini virgülle ayırarak yazın
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!productName || isLoading}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Açıklamalar Üretiliyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  SEO Açıklamaları Üret
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {descriptions && descriptions.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Üretilen SEO Açıklamaları</h3>
            <p className="text-gray-600">
              3 farklı ton ile hazırlanmış açıklamalar. Kopyala butonuna tıklayarak kolayca kullanabilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {descriptions.map((desc, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Header */}
                <div className={`px-6 py-4 ${
                  desc.tone === 'Premium' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  desc.tone === 'Praktik' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    {desc.tone === 'Premium' && (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {desc.tone === 'Praktik' && (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    )}
                    {desc.tone === 'Değer' && (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    )}
                    {desc.tone} Ton
                  </h4>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Ana Başlık</label>
                      <button
                        onClick={() => copyToClipboard(desc.title, index * 10 + 1)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
                      >
                        {copiedIndex === index * 10 + 1 ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Kopyalandı
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Kopyala
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm bg-gray-50 p-3 rounded border text-gray-800">
                      {desc.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {desc.title.length} karakter
                    </p>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Meta Açıklama</label>
                      <button
                        onClick={() => copyToClipboard(desc.metaDescription, index * 10 + 2)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
                      >
                        {copiedIndex === index * 10 + 2 ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Kopyalandı
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Kopyala
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm bg-gray-50 p-3 rounded border text-gray-800">
                      {desc.metaDescription}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {desc.metaDescription.length} karakter
                    </p>
                  </div>

                  {/* Long Description */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Uzun Açıklama</label>
                      <button
                        onClick={() => copyToClipboard(desc.longDescription, index * 10 + 3)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
                      >
                        {copiedIndex === index * 10 + 3 ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Kopyalandı
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Kopyala
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-sm bg-gray-50 p-3 rounded border text-gray-800 max-h-32 overflow-y-auto">
                      {desc.longDescription}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {desc.longDescription.split(' ').length} kelime, {desc.longDescription.length} karakter
                    </p>
                  </div>

                  {/* Tags */}
                  {desc.tags && desc.tags.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Önerilen Etiketler</label>
                        <button
                          onClick={() => copyToClipboard(desc.tags.join(', '), index * 10 + 4)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
                        >
                          {copiedIndex === index * 10 + 4 ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Kopyalandı
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Kopyala
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {desc.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              desc.tone === 'Premium' ? 'bg-purple-100 text-purple-800' :
                              desc.tone === 'Praktik' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-gray-600">SEO açıklamaları üretiliyor...</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            AI teknolojisi ile 3 farklı ton seçeneği hazırlanıyor
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !descriptions.length && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              SEO Açıklamaları Üretin
            </h3>
            <p className="text-gray-600 mb-8">
              Ürün bilgilerinizi yukarıdaki forma girin ve AI destekli SEO açıklamaları ürettin.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-medium text-purple-900 mb-2">Premium Ton</h4>
                <p className="text-gray-600">Lüks ve kalite odaklı açıklamalar</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-medium text-blue-900 mb-2">Pratik Ton</h4>
                <p className="text-gray-600">Günlük kullanım odaklı açıklamalar</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-medium text-green-900 mb-2">Değer Ton</h4>
                <p className="text-gray-600">Fiyat-performans odaklı açıklamalar</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
