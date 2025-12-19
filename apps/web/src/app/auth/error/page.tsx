'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Suspense } from 'react';

const errorMessages: Record<string, string> = {
  Configuration: 'Серверийн тохиргоонд алдаа гарсан байна.',
  AccessDenied: 'Хандах эрх хүрэлцэхгүй байна.',
  Verification: 'Баталгаажуулалтын холбоос хүчингүй эсвэл хугацаа дууссан байна.',
  OAuthSignin: 'OAuth нэвтрэх үед алдаа гарлаа.',
  OAuthCallback: 'OAuth callback алдаа.',
  OAuthCreateAccount: 'OAuth аккаунт үүсгэх үед алдаа гарлаа.',
  EmailCreateAccount: 'Email аккаунт үүсгэх үед алдаа гарлаа.',
  Callback: 'Callback алдаа.',
  OAuthAccountNotLinked: 'Энэ email хаяг өөр провайдертай холбогдсон байна.',
  EmailSignin: 'Email илгээх боломжгүй байна.',
  CredentialsSignin: 'Нэвтрэх нэр эсвэл нууц үг буруу байна.',
  SessionRequired: 'Энэ хуудсыг үзэхийн тулд нэвтэрнэ үү.',
  default: 'Нэвтрэх үед алдаа гарлаа.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-t-4 border-t-red-500 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Нэвтрэх алдаа
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error === 'OAuthAccountNotLinked' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Энэ email хаяг аль хэдийн бүртгэлтэй байна. 
                Өөр провайдер ашиглан нэвтэрнэ үү эсвэл шинэ email хаяг ашиглана уу.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-mono break-all">
                Error code: {error}
              </p>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <Link href="/api/auth/signin" className="block">
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Дахин оролдох
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Нүүр хуудас руу буцах
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Асуудал байвал админд хандана уу
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
