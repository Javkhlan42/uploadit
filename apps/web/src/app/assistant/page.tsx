'use client';

import React, { useState } from 'react';
import Header from '../Header';

interface Business {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  address: string;
  phoneNumber: string;
  description?: string;
  website?: string;
  similarity: number;
}

interface AIResponse {
  answer: string;
  businesses: Business[];
  metadata: {
    totalFound: number;
    filtered: {
      city?: string;
      category?: string;
    };
    model: string;
  };
  fromCache: boolean;
}

export default function AssistantPage() {
  const [question, setQuestion] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Асуултаа оруулна уу');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      const res = await fetch(`${apiUrl}/api/ai/yellow-books/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          city: city.trim() || undefined,
          category: category.trim() || undefined,
          limit: 5
        }),
      });

      if (!res.ok) {
        throw new Error('Серверийн алдаа гарлаа');
      }

      const data: AIResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    'Төв дүүрэгт сайн ресторан байна уу?',
    'Хан-Уулд эмнэлэг хаана байдаг вэ?',
    'Сонгинохайрхан дүүрэгт сургууль олох хэрэгтэй',
    'Баянзүрхэд банк байна уу?'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 Yellow Books AI Assistant
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Монгол хэлээр асууж, найдвартай бизнес олоорой
          </p>
          <p className="text-sm text-gray-500">
            Powered by Gemini AI • Semantic Search • RAG Technology
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Question Input */}
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                Асуултаа монгол хэлээр бичнэ үү
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Жишээ нь: Төв дүүрэгт сайн ресторан байна уу?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Хот / Дүүрэг (заавал биш)
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Жишээ нь: Сүхбаатар"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Ангилал (заавал биш)
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Жишээ нь: Ресторан"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Хайж байна...
                </span>
              ) : (
                '🔍 AI-аар хайх'
              )}
            </button>
          </form>

          {/* Example Questions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Жишээ асуултууд:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(q)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
            <p className="font-medium">❌ Алдаа гарлаа</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* AI Response */}
        {response && (
          <div className="space-y-6">
            {/* AI Answer */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-blue-100">
              <div className="flex items-start mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-2 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">AI хариулт</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                    <span className="bg-white px-2 py-1 rounded">
                      {response.metadata.model}
                    </span>
                    {response.fromCache && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        ⚡ Кэш
                      </span>
                    )}
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {response.answer}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Cards */}
            {response.businesses.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  📍 Санал болгож буй газрууд ({response.businesses.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {response.businesses.map((business, idx) => (
                    <div
                      key={business.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            {idx + 1}
                          </span>
                          <h4 className="text-lg font-bold text-gray-900">
                            {business.businessName}
                          </h4>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {Math.round(business.similarity * 100)}%
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center">
                          <span className="font-medium mr-2">📂</span>
                          {business.category}
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium mr-2">📍</span>
                          {business.city}, {business.state}
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium mr-2">📍</span>
                          {business.address}
                        </p>
                        <p className="flex items-center">
                          <span className="font-medium mr-2">📞</span>
                          <a href={`tel:${business.phoneNumber}`} className="text-blue-600 hover:underline">
                            {business.phoneNumber}
                          </a>
                        </p>
                        {business.website && (
                          <p className="flex items-center">
                            <span className="font-medium mr-2">🌐</span>
                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              {business.website}
                            </a>
                          </p>
                        )}
                        {business.description && (
                          <p className="mt-3 text-gray-700 pt-3 border-t border-gray-200">
                            {business.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>💡 Энэхүү систем нь Gemini AI, Semantic Search, болон RAG технологи ашиглан</p>
          <p>Yellow Books өгөгдлийн сангаас хамгийн тохиромжтой бизнесүүдийг санал болгоно.</p>
        </div>
      </main>
    </div>
  );
}
