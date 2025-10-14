'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {/* Icon */}
      {icon && (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {/* Primary Action */}
        {(actionLabel && (actionHref || onAction)) && (
          actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {actionLabel}
            </button>
          )
        )}

        {/* Secondary Action */}
        {(secondaryActionLabel && (secondaryActionHref || onSecondaryAction)) && (
          secondaryActionHref ? (
            <Link
              href={secondaryActionHref}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              {secondaryActionLabel}
            </Link>
          ) : (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// Specific empty state variants for common use cases

export function NoBookmarksEmpty() {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      }
      title="No bookmarked colleges yet"
      description="Start exploring colleges and bookmark your favorites to see them here. Your bookmarks will be saved and accessible from any device."
      actionLabel="Explore Colleges"
      actionHref="/colleges"
    />
  );
}

export function NoSavedScenariosEmpty() {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      }
      title="No saved ROI calculations"
      description="Calculate your first ROI scenario to see potential returns on your education investment. Your calculations will be saved here for easy comparison."
      actionLabel="Calculate ROI"
      actionHref="/roi-calculator"
    />
  );
}

export function NoCollegesSelectedEmpty() {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
      title="No colleges selected"
      description="Search for colleges above and add them to your comparison. You can compare up to 4 colleges side-by-side to make the best decision."
      actionLabel="Browse Colleges"
      actionHref="/colleges"
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title={query ? `No results for "${query}"` : "No results found"}
      description="Try adjusting your search terms or filters. You can also browse all colleges or search for specific programs."
      actionLabel="Clear Filters"
      actionHref="/colleges"
      secondaryActionLabel="Explore Programs"
      secondaryActionHref="/roi-calculator"
    />
  );
}

export function InsufficientDataEmpty() {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
      title="Insufficient data for trends"
      description="We need more historical data to generate accurate trends and predictions. Check back later as we continue to expand our dataset."
      actionLabel="Explore Other Features"
      actionHref="/roi-calculator"
    />
  );
}
