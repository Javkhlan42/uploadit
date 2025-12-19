import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { organizationService } from '../../services/organizationService';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Phone, Mail, MapPin, Sparkles } from 'lucide-react';

// Force dynamic rendering to avoid build-time API fetch
export const dynamic = 'force-dynamic';
// export const revalidate = 60

export const metadata: Metadata = {
  title: 'Yellow Books - Бүх бизнес',
  description: 'Орон нутгийн бизнесүүдийн бүрэн жагсаалт',
};

// Fast static content - renders immediately
async function StaticOrganizationsList() {
  const organizations = await organizationService.getOrganizations();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {organizations.slice(0, 6).map((org) => (
        <Link key={org.id} href={`/yellow-books/${org.id}`}>
          <Card className="hover:shadow-lg transition-shadow duration-200 border-gray-200 hover:border-yellow-300 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{org.logo}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-yellow-600 transition-colors">
                    {org.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {org.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {org.description}
              </p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{org.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{org.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// Streamed content - loads after initial page render
async function FeaturedOrganizations() {
  // Simulate slower data fetch for featured items
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const featured = await organizationService.getFeaturedOrganizations();

  return (
    <div className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8 border border-yellow-200">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold text-gray-900">Онцлох Бизнесүүд</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featured.map((org) => (
          <Link key={org.id} href={`/yellow-books/${org.id}`}>
            <Card className="hover:shadow-xl transition-all duration-200 border-yellow-300 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{org.logo}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 hover:text-yellow-600 transition-colors">
                        {org.name}
                      </h3>
                      <Badge className="mt-1 bg-yellow-400 text-yellow-900">
                        ⭐ Онцлох
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{org.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">{org.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{org.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Loading fallback for streamed section
function FeaturedSkeleton() {
  return (
    <div className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8 border border-yellow-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-yellow-200 rounded animate-pulse" />
        <div className="h-8 w-48 bg-yellow-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-yellow-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-yellow-200 rounded w-20 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function YellowBooksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Yellow Books 📖
              </h1>
              <p className="text-lg text-gray-600">
                Орон нутгийн бизнесүүдийн бүрэн лавлах
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/yellow-books/assistant"
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                AI Assistant
              </Link>
              <Link
                href="/yellow-books/search"
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium rounded-lg transition-colors"
              >
                Дэвшилтэд хайлт 🔍
              </Link>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <Link href="/" className="text-yellow-600 hover:text-yellow-700">
              ← Нүүр хуудас
            </Link>
            <Link href="/directory" className="text-yellow-600 hover:text-yellow-700">
              Лавлах →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Static content - renders immediately */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Бүх бизнесүүд
          </h2>
          <StaticOrganizationsList />
        </div>

        {/* Streamed content - loads progressively with Suspense */}
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedOrganizations />
        </Suspense>

        {/* ISR Info Banner */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ⚡ ISR (Incremental Static Regeneration)
          </h3>
          <p className="text-sm text-blue-700">
            Энэ хуудас 60 секунд тутамд автоматаар шинэчлэгдэнэ. Статик контент 
            шууд харагдаж, онцлох бизнесүүд progressive streaming-ээр ачаалагдана.
          </p>
        </div>
      </div>
    </div>
  );
}
