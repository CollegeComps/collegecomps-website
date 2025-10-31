'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BellAlertIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

interface AlertPreference {
  id: string;
  type: string;
  enabled: boolean;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function AlertsPage() {
  const { data: session } = useSession();
  const router = useRouter();
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
    if (!session) {
      router.push('/login?callbackUrl=/alerts');
      return;
    }

    if (!isPremium) {
      setLoading(false);
      return;
    }

    fetchAlertPreferences();
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
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/alerts/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: alerts }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Alert preferences saved successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save preferences' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving preferences' });
    } finally {
      setSaving(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-black py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full mb-6">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white font-bold mb-4">
              Premium Feature
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Custom Alerts & Notifications is available for Premium subscribers
            </p>
            <div className="bg-orange-500/10 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-white font-bold mb-4">Stay informed with:</h3>
              <ul className="text-left space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Email Alerts:</strong> Instant notifications for new salary data matching your profile</span>
                </li>
                <li className="flex items-start gap-3">
                  <BellAlertIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>ROI Changes:</strong> Get notified when college costs or outcomes change</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Deadline Reminders:</strong> Never miss scholarship or financial aid deadlines</span>
                </li>
                <li className="flex items-start gap-3">
                  <BriefcaseIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Career Insights:</strong> Weekly trends and opportunities for your major</span>
                </li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-bold mb-2">
            Alerts & Notifications
          </h1>
          <p className="text-lg text-gray-300">
            Customize how and when you receive important updates
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/20 text-green-400 border border-green-500' 
              : 'bg-red-900/20 text-red-400 border border-red-500'
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

        {/* Email Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <EnvelopeIcon className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white font-bold">Email Preferences</h2>
          </div>
          <p className="text-gray-300 mb-6">
            Notifications will be sent to: <strong>{session?.user?.email}</strong>
          </p>

          <div className="space-y-4">
            {alerts.map((alert) => {
              const IconComponent = alert.icon;
              return (
              <div
                key={alert.id}
                className="flex items-start justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    <IconComponent className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white font-bold">{alert.type}</h3>
                    <p className="text-sm text-gray-300 mt-1">{alert.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    alert.enabled ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
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
        </div>

        {/* Notification Frequency */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-white font-bold mb-4">Notification Frequency</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
              <input type="radio" name="frequency" value="instant" defaultChecked className="w-4 h-4 text-orange-500" />
              <div>
                <p className="font-semibold text-white font-bold">Instant</p>
                <p className="text-sm text-gray-300">Receive alerts as they happen</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
              <input type="radio" name="frequency" value="daily" className="w-4 h-4 text-orange-500" />
              <div>
                <p className="font-semibold text-white font-bold">Daily Digest</p>
                <p className="text-sm text-gray-300">One email per day with all updates</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
              <input type="radio" name="frequency" value="weekly" className="w-4 h-4 text-orange-500" />
              <div>
                <p className="font-semibold text-white font-bold">Weekly Summary</p>
                <p className="text-sm text-gray-300">One email per week with highlights</p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
