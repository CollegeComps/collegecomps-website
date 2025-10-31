'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams?.get('success');
  const error = searchParams?.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {success ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white font-bold mb-2">
                Successfully Unsubscribed
              </h1>
              <p className="text-gray-600">
                You've been unsubscribed from all marketing and product update emails.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> You'll still receive important account-related emails like password resets and security notifications.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Return to Homepage
              </Link>
              <Link
                href="/profile"
                className="block w-full text-center py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Manage Preferences
              </Link>
            </div>
          </>
        ) : error ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white font-bold mb-2">
                Unsubscribe Failed
              </h1>
              <p className="text-gray-600 mb-4">
                {error === 'invalid' 
                  ? 'Invalid unsubscribe link. Please use the link from your email.'
                  : 'An error occurred. Please try again later.'}
              </p>
            </div>

            <Link
              href="/"
              className="block w-full text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-700 transition-colors font-medium"
            >
              Return to Homepage
            </Link>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white font-bold mb-2">
                Manage Email Preferences
              </h1>
              <p className="text-gray-600">
                Update your email subscription preferences below.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
              <p>
                Please click the unsubscribe link in any email you've received to update your preferences.
              </p>
            </div>

            <Link
              href="/"
              className="block w-full text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Return to Homepage
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
