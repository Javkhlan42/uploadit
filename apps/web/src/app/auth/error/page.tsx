'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Нэвтрэх алдаа</h1>
          <p className="text-gray-600 mb-6">
            {error === 'Configuration' && 'NextAuth тохиргоонд алдаа гарлаа.'}
            {error === 'AccessDenied' && 'Хандах эрх хаагдсан байна.'}
            {error === 'Verification' && 'Баталгаажуулалт амжилтгүй боллоо.'}
            {!error && 'Нэвтрэх явцад алдаа гарлаа.'}
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-mono">Error: {error}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
          >
            Дахин нэвтрэх
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-center"
          >
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
}
