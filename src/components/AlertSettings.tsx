'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  BriefcaseIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

interface AlertPreference {
  id: string;
  type: string;
  enabled: boolean;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface AlertSettingsProps {
  compact?: boolean;
}

export default function AlertSettings({ compact = false }: AlertSettingsProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [alerts, setAlerts] = useState<AlertPreference[]>([
    {
      id: 'salary_updates',
      type: 'Salary Data Updates',
      enabled: true,
      description: 'Get notified when new salary data is available for your major or target schools',
      icon: CurrencyDollarIcon,
    },
    {
      id: 'roi_changes',
      type: 'ROI Changes',
      enabled: true,
      description: 'Alert when ROI calculations change significantly for your saved comparisons',
      icon: ChartBarIcon,
    },
    {
      id: 'scholarship_deadlines',
      type: 'Scholarship Deadlines',
      enabled: true,
      description: 'Reminders for financial aid and scholarship application deadlines',
      icon: CalendarIcon,
    },
    {
      id: 'career_insights',
      type: 'Career Insights',
      enabled: false,
      description: 'Weekly career insights and trends for your intended major',
      icon: BriefcaseIcon,
    },
    {
      id: 'college_updates',
      type: 'College Updates',
      enabled: false,
      description: 'Important updates from your target schools (tuition changes, new programs)',
      icon: BuildingOffice2Icon,
    },
  ]);

  const isPremium = session?.user?.subscriptionTier === 'premium';

  useEffect(() => {
    if (session && isPremium) {
      fetchAlertPreferences();
    } else {
      setLoading(false);
    }
  }, [session, isPremium]);

  const fetchAlertPreferences = async () => {
    try {
      const response = await fetch('/api/alerts/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setAlerts(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error fetching alert preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const handleSave = async () => {
    if (!isPremium) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/alerts/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: alerts })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Alert preferences saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save preferences' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-orange-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <BellAlertIcon className="w-8 h-8 text-orange-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              Alert Notifications - Premium Feature
            </h3>
            <p className="text-gray-300 mb-4">
              Get instant notifications about salary updates, ROI changes, scholarship deadlines, and more!
            </p>
            <a
              href="/pricing"
              className="inline-block px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Upgrade to Premium
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/50 text-green-300 border border-green-500/50' 
            : 'bg-red-900/50 text-red-300 border border-red-500/50'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {!compact && (
        <div className="mb-4">
          <p className="text-gray-300">
            Notifications will be sent to: <strong className="text-white">{session?.user?.email}</strong>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {alerts.map((alert) => {
          const IconComponent = alert.icon;
          return (
          <div
            key={alert.id}
            className={`flex items-start justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 hover:border-orange-500/30 transition-all ${
              compact ? 'p-3' : 'p-4'
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-1">
                <IconComponent className={`text-orange-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              <div>
                <h3 className={`font-semibold text-white ${compact ? 'text-sm' : ''}`}>
                  {alert.type}
                </h3>
                <p className={`text-gray-400 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {alert.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleAlert(alert.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alert.enabled ? 'bg-orange-500' : 'bg-gray-700'
              }`}
              aria-label={`Toggle ${alert.type}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alert.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(249,115,22,0.2)]"
      >
        {saving ? 'Saving...' : 'Save Alert Preferences'}
      </button>
    </div>
  );
}
