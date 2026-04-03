'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/institutions/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.institutions?.map((i: any) => i.name || i) || []);
          setShowSuggestions(true);
        }
      } catch {
        // silently fail
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    setSelectedInstitution(name);
    setQuery(name);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (selectedInstitution) {
      router.push(`/roi-calculator?school=${encodeURIComponent(selectedInstitution)}`);
    } else if (query.trim()) {
      router.push(`/roi-calculator?school=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/roi-calculator');
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedInstitution(''); }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter a college or university..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors text-sm sm:text-base"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
            >
              {suggestions.map((name, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(name)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:from-orange-700 hover:to-orange-600 transition-all active:scale-95 inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
        >
          Calculate ROI
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
      <p className="text-gray-500 text-xs mt-3 text-center">
        Search 6,000+ institutions. No account required.
      </p>
    </div>
  );
}
