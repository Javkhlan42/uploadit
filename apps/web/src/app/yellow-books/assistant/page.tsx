'use client';

import { useState } from 'react';
import { Search, Sparkles, MapPin, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';

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
  similarity?: number;
}

interface AISearchResponse {
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
  fromCache?: boolean;
}

export default function AssistantPage() {
  const [question, setQuestion] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AISearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Асуулт оруулна уу');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${API_BASE_URL}/ai/yellow-books/search`, {
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
        throw new Error('Хайлт амжилтгүй боллоо');
      }

      const data: AISearchResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Алдаа гарлаа. Дахин оролдоно уу.');
      console.error('AI Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-600">Бизнес хайх ухаалаг туслах</p>
              </div>
            </div>
            <Link href="/yellow-books">
              <Button variant="outline">Буцах</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Form */}
        <Card className="border-t-4 border-t-yellow-400 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Асуулт асуух
            </CardTitle>
            <CardDescription>
              Та монгол хэлээр асуулт асууна уу. Жишээ: &quot;Сүхбаатар дүүрэгт ресторан байна уу?&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Question Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Асуулт *
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Жишээ: Чингэлтэй дүүрэгт сайн кофе шоп байна уу?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Optional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Дүүрэг (заавал биш)
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Жишээ: Сүхбаатар"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Ангилал (заавал биш)
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Жишээ: Ресторан"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Хайж байна...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI-аар хайх
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mt-6 border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* AI Response */}
        {response && (
          <div className="mt-6 space-y-6">
            {/* AI Answer */}
            <Card className="border-l-4 border-l-yellow-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  AI Хариулт
                  {response.fromCache && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      Cache
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {response.answer}
                </p>
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  <p>
                    📊 Олдсон: {response.metadata.totalFound} бизнес | 
                    🤖 Model: {response.metadata.model}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Business Results */}
            {response.businesses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Санал болгож буй бизнесүүд
                </h2>
                <div className="space-y-4">
                  {response.businesses.map((business, index) => (
                    <Card key={business.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {index + 1}. {business.businessName}
                            </CardTitle>
                            <CardDescription>
                              {business.category} • {business.city}, {business.state}
                            </CardDescription>
                          </div>
                          {business.similarity && (
                            <div className="text-xs bg-yellow-100 px-2 py-1 rounded-full text-yellow-800">
                              {(business.similarity * 100).toFixed(1)}% match
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {business.description && (
                          <p className="text-gray-600 text-sm">{business.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {business.address}
                          </div>
                          <div>📞 {business.phoneNumber}</div>
                        </div>
                        {business.website && (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-600 hover:text-yellow-700 text-sm underline"
                          >
                            Вэбсайт үзэх →
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
