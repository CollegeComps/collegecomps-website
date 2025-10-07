'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { SparklesIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface AISuggestion {
  name: string;
  reason?: string;
  type?: string;
  location?: string;
  tuition?: number;
  career_prospects?: string;
  school_count?: number;
}

interface AIAutocompleteProps {
  type: 'school' | 'major';
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder: string;
  context?: any;
  className?: string;
}

export default function AIAutocomplete({
  type,
  value,
  onChange,
  onSelect,
  placeholder,
  context = {},
  className = '',
}: AIAutocompleteProps) {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isPremium = session?.user?.subscriptionTier === 'premium';

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with AI enhancement
  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let endpoint = '';
        let response;

        // Try AI suggestions first if premium
        if (isPremium && useAI) {
          response = await fetch('/api/ai/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: value,
              type,
              context,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
            setLoading(false);
            return;
          }
        }

        // Fallback to regular search
        if (type === 'school') {
          endpoint = `/api/institutions/search?q=${encodeURIComponent(value)}`;
        } else {
          endpoint = `/api/majors/search?q=${encodeURIComponent(value)}`;
        }

        response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const items = data.institutions || data.majors || data;
          
          // Transform to suggestion format
          setSuggestions(
            items.map((item: string) => ({
              name: item,
              reason: 'Matches your search',
            }))
          );
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, type, context, isPremium, useAI]);

  const handleSelect = (suggestion: AISuggestion) => {
    onSelect(suggestion.name);
    onChange(suggestion.name);
    setShowSuggestions(false);
  };

  const getSuggestionIcon = (suggestion: AISuggestion) => {
    if (suggestion.type === 'reach') return '🎯';
    if (suggestion.type === 'match') return '✅';
    if (suggestion.type === 'safety') return '🛡️';
    return '📚';
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 ${className}`}
        />
        
        {/* AI Toggle (Premium only) */}
        {isPremium && (
          <button
            onClick={() => setUseAI(!useAI)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors ${
              useAI 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={useAI ? 'AI suggestions enabled' : 'Click for AI suggestions'}
          >
            <SparklesIcon className="w-5 h-5" />
          </button>
        )}

        {!isPremium && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LockClosedIcon className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {useAI && isPremium && (
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">AI-Enhanced Suggestions</span>
            </div>
          )}

          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                {useAI && suggestion.type && (
                  <span className="text-xl">{getSuggestionIcon(suggestion)}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{suggestion.name}</p>
                  
                  {suggestion.reason && (
                    <p className="text-sm text-gray-600 mt-1">{suggestion.reason}</p>
                  )}
                  
                  {suggestion.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {suggestion.location}</p>
                  )}
                  
                  {suggestion.career_prospects && (
                    <p className="text-xs text-gray-500 mt-1">💼 {suggestion.career_prospects}</p>
                  )}

                  {suggestion.tuition && (
                    <p className="text-xs text-gray-500 mt-1">
                      💰 ${suggestion.tuition.toLocaleString()}/year
                    </p>
                  )}

                  {suggestion.school_count && (
                    <p className="text-xs text-gray-500 mt-1">
                      🏫 {suggestion.school_count} schools offer this
                    </p>
                  )}

                  {useAI && suggestion.type && (
                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                      suggestion.type === 'reach' 
                        ? 'bg-red-100 text-red-700'
                        : suggestion.type === 'safety'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {suggestion.type}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Premium Upsell */}
      {!isPremium && value.length >= 2 && (
        <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <SparklesIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Get AI-powered suggestions with Premium
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Smart recommendations based on your profile, budget, and goals
              </p>
              <a
                href="/pricing"
                className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Upgrade now →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
