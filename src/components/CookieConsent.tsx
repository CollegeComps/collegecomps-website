'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after 1 second to avoid layout shift
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
        applyConsent(saved);
      } catch (e) {
        setShowBanner(true);
      }
    }
  }, []);

  const applyConsent = (prefs: typeof preferences) => {
    // Apply analytics consent
    if (prefs.analytics) {
      // Enable Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      }
    } else {
      // Disable Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied'
        });
      }
    }

    // Apply marketing consent
    if (prefs.marketing) {
      // Enable marketing cookies (if you use them in the future)
    }
  };

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    applyConsent(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    applyConsent(allAccepted);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    applyConsent(onlyNecessary);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner - Modern dark theme */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-gray-900 to-black border-t border-orange-500/30 shadow-[0_-10px_40px_rgba(249,115,22,0.2)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {showSettings ? (
            // Settings View
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                    </svg>
                    Cookie Preferences
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Manage your cookie settings. Learn more in our{' '}
                    <a href="/privacy" className="text-orange-500 hover:text-orange-400 transition-colors">Privacy Policy</a>.
                  </p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="ml-4 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-orange-500/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-white">Necessary Cookies</h4>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">Required</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Essential for website functionality, authentication, and security. Cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-orange-500/30 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Analytics Cookies</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Help us understand how you use our website and improve your experience (Google Analytics).
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-orange-500/30 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Marketing Cookies</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Used to show you relevant advertisements (currently not in use).
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={savePreferences}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg hover:shadow-orange-500/50"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-3 bg-gray-800 border border-gray-700 text-white font-semibold rounded-xl hover:border-orange-500/50 hover:bg-gray-700 transition-all"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            // Main Banner View
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                  </svg>
                  <h3 className="font-bold text-white">We Value Your Privacy</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies.{' '}
                  <a href="/privacy" className="text-orange-500 hover:text-orange-400 transition-colors font-medium">Read our Privacy Policy</a>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors font-medium"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 text-sm text-orange-500 border border-orange-500/50 rounded-lg hover:bg-orange-500/10 transition-colors font-medium"
                >
                  Customize
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-400 transition-all font-medium shadow-lg hover:shadow-orange-500/50"
                >
                  Accept All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
