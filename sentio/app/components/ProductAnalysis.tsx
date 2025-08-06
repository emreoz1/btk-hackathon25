import React from 'react';

interface Analysis {
  pros: string[];
  cons: string[];
  overallSentiment: 'positive' | 'negative' | 'neutral';
  userSatisfactionScore: number;
  summary: string;
}

interface ProductAnalysisProps {
  analysis?: Analysis;
  productName: string;
  isLoading: boolean;
}

const ProductAnalysis: React.FC<ProductAnalysisProps> = ({ analysis, productName, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Analiz verisi bulunamadı</p>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Pozitif';
      case 'negative': return 'Negatif';
      default: return 'Nötr';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Kullanıcı Yorumları Analizi
        </h3>
        <p className="text-sm text-gray-600">{productName}</p>
      </div>

      {/* Genel Skorlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Memnuniyet Puanı</h4>
          <div className="flex items-center">
            <span className={`text-2xl font-bold ${getScoreColor(analysis.userSatisfactionScore)}`}>
              {analysis.userSatisfactionScore}/10
            </span>
            <div className="ml-3 flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  analysis.userSatisfactionScore >= 8 ? 'bg-green-500' :
                  analysis.userSatisfactionScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.userSatisfactionScore * 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Genel Duygu</h4>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(analysis.overallSentiment)}`}>
            {getSentimentText(analysis.overallSentiment)}
          </span>
        </div>
      </div>

      {/* Artılar */}
      <div>
        <h4 className="font-semibold text-green-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Beğenilen Yönler
        </h4>
        <ul className="space-y-2">
          {analysis.pros.map((pro, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Eksiler */}
      <div>
        <h4 className="font-semibold text-red-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Eleştirilen Yönler
        </h4>
        <ul className="space-y-2">
          {analysis.cons.map((con, index) => (
            <li key={index} className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <span className="text-gray-700">{con}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Özet */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Özet Değerlendirme</h4>
        <p className="text-blue-700 leading-relaxed">{analysis.summary}</p>
      </div>
    </div>
  );
};

export default ProductAnalysis;
