# 🛍️ Sentio - AI-Powered E-Commerce Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black.svg?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI-4285F4.svg)](https://ai.google.dev/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-00D4AA.svg)](https://www.pinecone.io/)

## 📋 Proje Açıklaması

**Sentio**, yapay zeka teknolojilerini kullanarak e-ticaret deneyimini devrim niteliğinde değiştiren akıllı bir platform. Kullanıcıların ürün arama, karşılaştırma, analiz ve karar verme süreçlerini optimize eden gelişmiş özellikler sunmaktadır.

### 🎯 Temel Özellikler

- **🔍 Akıllı Ürün Arama**: Semantic search teknolojisi ile doğal dil kullanarak ürün arama
- **🖼️ Görsel Ürün Tanıma**: Görsel yükleyerek ürün arama ve tanımlama
- **📊 Yapay Zeka Tabanlı Ürün Analizi**: Kullanıcı yorumları ve sentiment analizi
- **⚖️ Ürün Karşılaştırma**: AI destekli detaylı ürün karşılaştırması
- **📝 SEO İçerik Üretici**: Ürün açıklamaları için AI-powered SEO içeriği
- **🎛️ Gelişmiş Filtreleme**: Kategori, fiyat ve diğer kriterlere göre filtreleme

### 💡 İnovasyon Değeri

Sentio, geleneksel e-ticaret arama deneyimini AI ile dönüştürerek:
- Kullanıcı niyetini anlamak için doğal dil işleme
- Görseller üzerinden ürün tanıma ve arama
- Sentiment analizi ile ürün kalitesi değerlendirmesi
- Vector search ile semantik benzerlik tabanlı öneriler

## 🚀 Kullanılan Teknolojiler

### Frontend & Backend
- **Next.js 15.4.5**: React framework ile full-stack uygulama
- **TypeScript**: Type-safe geliştirme
- **Tailwind CSS**: Modern ve responsive UI tasarımı
- **React 18**: Kullanıcı arayüzü geliştirme (Next.js ile birlikte)

### Yapay Zeka ve Makine Öğrenmesi
- **Google Gemini AI API**:
  - `text-embedding-004`: 768 boyutlu vector embeddings
  - `gemini-1.5-pro`: Metin analizi ve generation
  - `gemini-1.5-flash`: Görsel analizi (Vision AI)
- **Pinecone Vector Database**:
  - Metric: Cosine similarity
  - Dimensions: 768
  - Type: Dense vectors
  - Capacity: Serverless mode

### Geliştirme Araçları
- **Node.js**: Backend runtime
- **Google AI SDK**: Gemini AI modelleri ile entegrasyon
- **@pinecone-database/pinecone**: Vector database client
- **dotenv**: Environment variable yönetimi

## 🤖 Yapay Zeka Modelleri ve Kullanım Alanları

### 1. Text Embedding (text-embedding-004)
**Kullanıldığı Agent:** Data Ingestion & Search Agent
- **Amaç**: Ürün ve yorum verilerini vektör formatına dönüştürme
- **Boyut**: 768-dimensional embeddings
- **Kullanım**: Semantic search ve benzerlik hesaplama

### 2. Gemini 1.5 Pro
**Kullanıldığı Agent:** Analysis & Content Generation Agent
- **Amaç**: 
  - Ürün yorumlarının sentiment analizi
  - Detaylı ürün analizi raporları
  - SEO-friendly ürün açıklamaları üretme
  - Ürün karşılaştırma analizleri

### 3. Gemini 1.5 Flash (Vision)
**Kullanıldığı Agent:** Visual Recognition Agent
- **Amaç**: 
  - Yüklenen görsellerdeki ürünleri tanıma
  - Görsel özelliklerini metin formatına çevirme
  - Arama sorgularına optimizasyon

## 📊 Veri Mimarisi ve Pinecone Konfigürasyonu

### Vector Database Detayları
```
Index Name: sentio-main-index
Metric: cosine
Dimensions: 768
Type: Dense
Capacity Mode: Serverless
```

### Veri Yapısı
- **Ürün Vektörleri**: ID format `product_{id}`
- **Yorum Vektörleri**: ID format `review_{id}`
- **Metadata**: Kategori, fiyat, brand, rating, sentiment bilgileri

### Mock Veri Kullanımı
Hackathon süresinin kısıtlılığı nedeniyle:
- Akakçe gibi sitelerden canlı web scraping yerine mock data kullanıldı
- `data/products.json` ve `data/reviews.json` dosyalarından sample data
- `scripts/ingestData.js` ile Pinecone'a veri beslemesi

## 🏗️ Teknik Mimari

### API Endpoints
- `/api/search`: Semantic ürün arama
- `/api/analyze`: Ürün analizi ve sentiment analysis
- `/api/compare`: Ürün karşılaştırma
- `/api/vision`: Görsel ürün tanıma
- `/api/seo-generator`: SEO içerik üretimi
- `/api/product-detail`: Detaylı ürün bilgisi

### Agentic AI Yaklaşımı
Her API endpoint, spesifik bir görev için optimize edilmiş AI agent gibi çalışır:
1. **Search Agent**: Kullanıcı sorgusunu embedding'e çevirip Pinecone'da arama
2. **Analysis Agent**: Yorumları toplayıp sentiment analizi
3. **Vision Agent**: Görsel tanıma ve optimizasyon
4. **Content Agent**: SEO ve pazarlama içeriği üretimi

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Google AI API Key
- Pinecone API Key

### Adımlar

1. **Repository'yi klonlayın**:
```bash
git clone https://github.com/emreoz1/btk-hackathon25.git
cd btk-hackathon25/sentio
```

2. **Dependencies'leri yükleyin**:
```bash
npm install
```

3. **Environment variables ayarlayın**:
```bash
cp .env.local.example .env.local
# .env.local dosyasına API key'lerinizi ekleyin
```

4. **Mock veriyi Pinecone'a yükleyin**:
```bash
npm run ingest
```

5. **Development server'ı başlatın**:
```bash
npm run dev
```

6. **Uygulamayı açın**: http://localhost:3000

## 📈 Gelecek Roadmap

- [ ] Real-time web scraping integration
- [ ] Multi-language support
- [ ] Price tracking ve alerts
- [ ] User accounts ve wishlist
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] B2B marketplace features

## 👨‍💻 Geliştirici

AI-Powered E-Commerce Solutions

---

*"Sentio ile e-ticaret deneyiminizi yapay zeka ile güçlendirin!"* 🚀
