'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SavedComparison {
  id: number;
  name: string;
  colleges: string[];
  program_data: any;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function SavedComparisonsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);

  const isPremium = session?.user?.subscriptionTier === 'premium';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/saved-comparisons');
    } else if (status === 'authenticated') {
      fetchComparisons();
    }
  }, [status, router]);

  const fetchComparisons = async () => {
    try {
      const response = await fetch('/api/saved-comparisons');
      const data = await response.json();
      setComparisons(data.comparisons || []);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComparison = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comparison?')) return;

    try {
      await fetch(`/api/saved-comparisons?id=${id}`, { method: 'DELETE' });
      setComparisons(comparisons.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting comparison:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💾 Saved Comparisons
          </h1>
          <p className="text-gray-600">
            Manage your saved college comparisons
            {!isPremium && (
              <span className="ml-2 text-sm">
                ({comparisons.length}/3 used · 
                <Link href="/pricing" className="text-blue-600 hover:text-blue-700 ml-1">
                  Upgrade for unlimited
                </Link>)
              </span>
            )}
          </p>
        </div>

        {/* Premium Upsell for Free Users */}
        {!isPremium && (
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Unlock Unlimited Saved Comparisons</h3>
                <p className="text-blue-100">
                  Save as many comparisons as you want with Premium, plus get export features and more.
                </p>
              </div>
              <Link
                href="/pricing"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* Comparisons List */}
        {comparisons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved comparisons yet</h3>
            <p className="text-gray-600 mb-6">
              Start comparing colleges and save your analyses for later reference.
            </p>
            <Link
              href="/compare"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Comparison
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {comparisons.map((comparison) => (
              <div key={comparison.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {comparison.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {comparison.colleges.length} colleges
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(comparison.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    {comparison.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        {comparison.notes}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {comparison.colleges.slice(0, 5).map((college, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                          {college}
                        </span>
                      ))}
                      {comparison.colleges.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          +{comparison.colleges.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => alert('View comparison (feature coming soon)')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View comparison"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteComparison(comparison.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete comparison"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
