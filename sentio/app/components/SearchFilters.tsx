'use client';

import { useState } from 'react';

interface SearchFiltersProps {
  onFilterChange: (query: string, filters: any) => void;
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'Telefon', label: 'Telefon' },
    { value: 'Laptop', label: 'Laptop' },
    { value: 'Kulaklık', label: 'Kulaklık' },
    { value: 'Ev Elektroniği', label: 'Ev Elektroniği' },
    { value: 'Oyun', label: 'Oyun' },
    { value: 'Aksesuar', label: 'Aksesuar' }
  ];

  const priceRanges = [
    { label: 'Tümü', min: '', max: '' },
    { label: '0 - 1.000 ₺', min: 0, max: 1000 },
    { label: '1.000 - 5.000 ₺', min: 1000, max: 5000 },
    { label: '5.000 - 15.000 ₺', min: 5000, max: 15000 },
    { label: '15.000 - 50.000 ₺', min: 15000, max: 50000 },
    { label: '50.000+ ₺', min: 50000, max: '' }
  ];

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    applyFilters(newCategory, priceRange);
  };

  const handlePriceRangeChange = (min: string | number, max: string | number) => {
    const newRange = { 
      min: min === '' ? '' : String(min), 
      max: max === '' ? '' : String(max) 
    };
    setPriceRange(newRange);
    applyFilters(category, newRange);
  };

  const applyFilters = (cat: string, price: { min: string, max: string }) => {
    const filters: any = {};
    
    if (cat !== 'all') {
      filters.category = cat;
    }
    
    if (price.min) {
      filters.minPrice = parseInt(price.min);
    }
    
    if (price.max) {
      filters.maxPrice = parseInt(price.max);
    }

    // We need the current search query - this is a simplified version
    // In a real app, you'd pass the current query or store it in context
    onFilterChange('', filters);
  };

  const clearFilters = () => {
    setCategory('all');
    setPriceRange({ min: '', max: '' });
    onFilterChange('', {});
  };

  const hasActiveFilters = category !== 'all' || priceRange.min || priceRange.max;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <h3 className="font-semibold text-gray-900">Filtreler</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-600 text-sm flex items-center"
        >
          {isOpen ? 'Gizle' : 'Göster'}
          <svg
            className={`w-4 h-4 ml-1 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filters Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat Aralığı
            </label>
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handlePriceRangeChange(range.min, range.max)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-colors ${
                    priceRange.min === String(range.min) && priceRange.max === String(range.max)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Özel Fiyat Aralığı
            </label>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min fiyat"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <input
                type="number"
                placeholder="Max fiyat"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                onClick={() => applyFilters(category, priceRange)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters & Clear Button */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {category !== 'all' && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    Kategori: {categories.find(c => c.value === category)?.label}
                  </span>
                )}
                {(priceRange.min || priceRange.max) && (
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                    Fiyat: {priceRange.min || '0'} - {priceRange.max || '∞'} ₺
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Temizle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
