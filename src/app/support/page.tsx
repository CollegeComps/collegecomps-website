'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LifebuoyIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  XCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Ticket {
  id: number;
  subject: string;
  category: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
  response_count: number;
}

const categories = [
  { value: 'technical', label: 'Technical Issues', icon: '' },
  { value: 'billing', label: 'Billing & Subscription', icon: '' },
  { value: 'feature_request', label: 'Feature Request', icon: '' },
  { value: 'account', label: 'Account Issues', icon: '' },
  { value: 'data', label: 'Data Questions', icon: '' },
  { value: 'general', label: 'General Inquiry', icon: '' },
];

export default function SupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('technical');
  const [description, setDescription] = useState('');

  const tier = session?.user?.subscriptionTier || 'free';
  const isProfessional = tier === 'professional';
  const isPremium = tier === 'premium';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/support');
    } else if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status, router]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, description }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message + '\n\n' + data.priority);
        setSubject('');
        setCategory('technical');
        setDescription('');
        setShowNewTicket(false);
        fetchTickets();
      } else {
        alert('Failed to submit ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-500" />;
      case 'resolved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-600',
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <LifebuoyIcon className="w-10 h-10 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900">Support Center</h1>
              </div>
              <p className="text-lg text-gray-600">
                Get help from our support team
                {isProfessional && <span className="ml-2 text-purple-600 font-semibold">Priority Support Active</span>}
                {isPremium && <span className="ml-2 text-blue-600 font-semibold">Premium Support Active</span>}
              </p>
            </div>
            <button
              onClick={() => setShowNewTicket(!showNewTicket)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
            >
              <PlusIcon className="w-5 h-5" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Support Tier Info */}
        <div className="mb-6 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Your Support Tier</span>
              {isProfessional && <SparklesIcon className="w-5 h-5 text-purple-600" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isProfessional ? 'Priority' : isPremium ? 'Premium' : 'Standard'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <span className="text-sm font-medium text-gray-600 block mb-2">Response Time</span>
            <p className="text-2xl font-bold text-gray-900">
              {isProfessional ? '4 hours' : isPremium ? '24 hours' : '48 hours'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <span className="text-sm font-medium text-gray-600 block mb-2">Open Tickets</span>
            <p className="text-2xl font-bold text-gray-900">
              {tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length}
            </p>
          </div>
        </div>

        {/* New Ticket Form */}
        {showNewTicket && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="text-gray-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500"
                  placeholder="Please provide as much detail as possible..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="px-6 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Tickets</h2>
          
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <LifebuoyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No support tickets yet</p>
              <p className="text-gray-500">Click "New Ticket" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/support/${ticket.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {categories.find(c => c.value === ticket.category)?.label || ticket.category}</span>
                        <span>•</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{ticket.response_count} {ticket.response_count === 1 ? 'response' : 'responses'}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade Notice for Free Users */}
        {!isPremium && !isProfessional && (
          <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Get Faster Support</h3>
                <p className="text-blue-100 mb-4">
                  Upgrade to Premium for 24-hour response time, or Excel for priority 4-hour support
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/pricing"
                    className="inline-block bg-white text-blue-600 font-bold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
              <SparklesIcon className="w-16 h-16 text-white/30" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
