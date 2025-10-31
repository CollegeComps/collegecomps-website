'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ShareIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Comparison {
  id: number;
  name: string;
  colleges: string[];
  created_at: string;
}

export default function ExportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const isPremium = session?.user?.subscriptionTier === 'premium';

  useEffect(() => {
    if (!session) {
      router.push('/login?callbackUrl=/exports');
      return;
    }

    if (!isPremium) {
      setLoading(false);
      return;
    }

    fetchComparisons();
  }, [session, isPremium]);

  const fetchComparisons = async () => {
    try {
      const response = await fetch('/api/saved-comparisons');
      if (response.ok) {
        const data = await response.json();
        setComparisons(data.comparisons || []);
      }
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!selectedComparison) {
      alert('Please select a comparison to export');
      return;
    }

    setExporting(true);

    try {
      const response = await fetch('/api/exports/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comparisonId: selectedComparison,
          format,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparison-${selectedComparison}.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert('An error occurred during export');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!selectedComparison) {
      alert('Please select a comparison to share');
      return;
    }

    try {
      const response = await fetch('/api/exports/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comparisonId: selectedComparison }),
      });

      if (response.ok) {
        const data = await response.json();
        const shareUrl = `${window.location.origin}/shared/${data.shareToken}`;
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert(`Share link copied to clipboard!\n${shareUrl}`);
      } else {
        alert('Failed to create share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('An error occurred while creating share link');
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mb-6">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white font-bold mb-4">
              Premium Feature
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Export & Reports is available for Premium subscribers
            </p>
            <div className="bg-orange-500/10 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-white font-bold mb-4">Unlock powerful export options:</h3>
              <ul className="text-left space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <DocumentTextIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>PDF Export:</strong> Professional reports with charts and analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <TableCellsIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Excel/CSV Export:</strong> Full data for your own analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShareIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Shareable Links:</strong> Share comparisons with counselors and family</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Custom Reports:</strong> Include your personal data and preferences</span>
                </li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-8 py-4 rounded-lg text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading comparisons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-bold mb-2">
            Export & Reports
          </h1>
          <p className="text-lg text-gray-300">
            Download your comparisons and create shareable links
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Comparison Selector */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-white font-bold mb-4">Select Comparison</h2>
              
              {comparisons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No saved comparisons yet</p>
                  <Link
                    href="/compare"
                    className="text-orange-500 hover:underline font-medium"
                  >
                    Create one now →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {comparisons.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedComparison(comp.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedComparison === comp.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-white font-bold hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-semibold">{comp.name}</p>
                      <p className={`text-xs mt-1 ${
                        selectedComparison === comp.id ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {comp.colleges?.length || 0} colleges • {new Date(comp.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Export Options */}
          <div className="md:col-span-2 space-y-6">
            {/* Export Formats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-white font-bold mb-4">Export Format</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!selectedComparison || exporting}
                  className="flex flex-col items-center gap-3 p-6 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentTextIcon className="w-12 h-12 text-red-600" />
                  <span className="font-semibold text-white font-bold">PDF</span>
                  <span className="text-xs text-gray-300 text-center">Professional report with charts</span>
                </button>

                <button
                  onClick={() => handleExport('excel')}
                  disabled={!selectedComparison || exporting}
                  className="flex flex-col items-center gap-3 p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TableCellsIcon className="w-12 h-12 text-green-600" />
                  <span className="font-semibold text-white font-bold">Excel</span>
                  <span className="text-xs text-gray-300 text-center">Spreadsheet for analysis</span>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  disabled={!selectedComparison || exporting}
                  className="flex flex-col items-center gap-3 p-6 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentArrowDownIcon className="w-12 h-12 text-orange-500" />
                  <span className="font-semibold text-white font-bold">CSV</span>
                  <span className="text-xs text-gray-300 text-center">Raw data file</span>
                </button>
              </div>
            </div>

            {/* Share Link */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-white font-bold mb-4">Share Comparison</h2>
              <p className="text-gray-300 mb-4">
                Create a shareable link that anyone can view (no account required)
              </p>
              <button
                onClick={handleShare}
                disabled={!selectedComparison}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
              >
                <ShareIcon className="w-5 h-5" />
                Generate Share Link
              </button>
            </div>

            {/* Custom Report Options */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-white font-bold mb-4">Custom Report Options</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 rounded" />
                  <span className="text-gray-300">Include ROI analysis</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 rounded" />
                  <span className="text-gray-300">Include salary data</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 rounded" />
                  <span className="text-gray-300">Include cost breakdown</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-orange-500 rounded" />
                  <span className="text-gray-300">Include personal notes</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-orange-500 rounded" />
                  <span className="text-gray-300">Include financial aid estimates</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
