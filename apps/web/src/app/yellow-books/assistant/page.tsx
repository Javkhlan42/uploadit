'use client';

import { useState } from 'react';
import Link from 'next/link';

// AI-powered Yellow Pages Assistant
interface Business {
  id: string;
  businessName: string;
  category: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  description?: string;
}

interface AIResponse {
  answer: string;
  businesses: Business[];
}

export default function AssistantPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Use backend API URL directly for production
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/ai/yellow-books/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data: AIResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            href="/" 
            className="inline-block mb-6 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Ask me anything about local businesses and I&apos;ll help you find what you need!
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Find me a good pizza place near downtown'"
              className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Thinking...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* AI Response */}
        {response && (
          <div className="space-y-6">
            {/* AI Answer */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    AI Response
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {response.answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Results */}
            {response.businesses.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  📍 Recommended Businesses
                </h3>
                <div className="grid gap-4">
                  {response.businesses.map((business) => (
                    <div
                      key={business.id}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-semibold text-gray-900">
                          {business.businessName}
                        </h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {business.category}
                        </span>
                      </div>
                      
                      {business.description && (
                        <p className="text-gray-600 mb-3">{business.description}</p>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-medium">📍 Address:</span>
                          <span>{business.address}, {business.city}, {business.state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-medium">📞 Phone:</span>
                          <a 
                            href={`tel:${business.phoneNumber}`}
                            className="text-blue-600 hover:underline"
                          >
                            {business.phoneNumber}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Example Queries */}
        {!response && !loading && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Try asking:
            </h3>
            <div className="grid gap-3">
              {[
                'Find me a good Italian restaurant',
                'Where can I get my car fixed?',
                'I need a plumber in downtown',
                'Best coffee shops near me',
                'Recommend a good law firm',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-gray-700">{example}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
