'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/formatting';
import { BriefcaseIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Occupation {
  soc_code: string;
  title: string;
  median_annual_wage: number | null;
  wage_25th: number | null;
  wage_75th: number | null;
  total_employment: number | null;
  major_category: string | null;
  relevance_score: number | null;
}

interface OccupationSummary {
  count: number;
  median: number;
  min: number;
  max: number;
  avg: number;
}

interface CareerOutlookProps {
  cipcode: string;
  programTitle?: string;
  /** Compact mode shows fewer items and a smaller layout */
  compact?: boolean;
  /** Maximum number of occupations to show initially */
  initialCount?: number;
}

export function CareerOutlook({ cipcode, programTitle, compact = false, initialCount = 5 }: CareerOutlookProps) {
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [summary, setSummary] = useState<OccupationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!cipcode) return;
    setLoading(true);
    setError(null);

    fetch(`/api/occupation-salary?cipcode=${encodeURIComponent(cipcode)}&limit=20`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setOccupations(data.occupations || []);
        setSummary(data.summary || null);
      })
      .catch(() => setError('Unable to load career data'))
      .finally(() => setLoading(false));
  }, [cipcode]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-2/3" />
      </div>
    );
  }

  if (error || occupations.length === 0) return null;

  const withSalary = occupations.filter(o => o.median_annual_wage != null);
  if (withSalary.length === 0) return null;

  const visibleOccupations = expanded ? withSalary : withSalary.slice(0, initialCount);
  const hasMore = withSalary.length > initialCount;

  if (compact) {
    return (
      <div className="mt-2">
        {summary && (
          <div className="flex items-center gap-2 text-xs">
            <BriefcaseIcon className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <span className="text-gray-400">
              Related careers: median {formatCurrency(summary.median)}/yr
            </span>
            <span className="text-gray-600">
              ({formatCurrency(summary.min)} – {formatCurrency(summary.max)})
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <BriefcaseIcon className="h-5 w-5 text-orange-400" />
        <h3 className="text-sm font-semibold text-white">
          Career Outlook {programTitle ? `for ${programTitle}` : ''}
        </h3>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Median Salary</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(summary.median)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Salary Range</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(summary.min)} – {formatCurrency(summary.max)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Related Careers</p>
            <p className="text-lg font-bold text-orange-400">{summary.count}</p>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {visibleOccupations.map(occ => (
          <div
            key={occ.soc_code}
            className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-b-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{occ.title}</p>
              {occ.total_employment && (
                <p className="text-xs text-gray-500">
                  {(occ.total_employment / 1000).toFixed(0)}k employed nationally
                </p>
              )}
            </div>
            <div className="text-right ml-3 shrink-0">
              {occ.median_annual_wage && (
                <p className="text-sm font-semibold text-green-400">
                  {formatCurrency(occ.median_annual_wage)}
                </p>
              )}
              {occ.wage_25th && occ.wage_75th && (
                <p className="text-xs text-gray-500">
                  {formatCurrency(occ.wage_25th)} – {formatCurrency(occ.wage_75th)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          {expanded ? (
            <>Show less <ChevronUpIcon className="h-3 w-3" /></>
          ) : (
            <>Show {withSalary.length - initialCount} more careers <ChevronDownIcon className="h-3 w-3" /></>
          )}
        </button>
      )}

      <p className="text-[10px] text-gray-600 mt-2">
        Source: Bureau of Labor Statistics, Occupational Employment & Wage Statistics (May 2024)
      </p>
    </div>
  );
}
