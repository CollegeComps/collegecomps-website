'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Ticket {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  subscription_tier: string;
  subject: string;
  category: string;
  priority: 'low' | 'normal' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_admin_reply: number;
  created_at: string;
  author_name: string;
  author_email: string;
}

export default function AdminTicketDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTicketDetails();
    }
  }, [status, router, ticketId]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ticket');
      }

      setTicket(data.ticket);
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText })
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      setReplyText('');
      await fetchTicketDetails(); // Refresh to show new message
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const updateTicket = async (updates: { status?: string; priority?: string }) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }

      await fetchTicketDetails(); // Refresh
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Failed to update ticket. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-white font-bold';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-white font-bold';
      default: return 'bg-gray-100 text-white font-bold';
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-300',
      premium: 'bg-blue-100 text-orange-400',
      professional: 'bg-purple-100 text-purple-700'
    };
    return colors[tier] || colors.free;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/admin/support"
            className="inline-flex items-center text-orange-500 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Support Dashboard
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || 'Ticket not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href="/admin/support"
          className="inline-flex items-center text-orange-500 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Support Dashboard
        </Link>

        {/* Ticket Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white font-bold mb-2">
                #{ticket.id} - {ticket.subject}
              </h1>
              <p className="text-gray-300">Category: {ticket.category}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority} priority
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-300">User</p>
              <p className="font-medium text-white font-bold">{ticket.user_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Email</p>
              <p className="font-medium text-white font-bold">{ticket.user_email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Subscription</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierBadge(ticket.subscription_tier)}`}>
                {ticket.subscription_tier}
              </span>
            </div>
          </div>

          {/* Update Controls */}
          <div className="border-t mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={ticket.status}
                onChange={(e) => updateTicket({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={ticket.priority}
                onChange={(e) => updateTicket({ priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t mt-4 pt-4 flex items-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-bold text-white font-bold mb-4 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Conversation
          </h2>

          <div className="space-y-4 mb-6">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No messages yet</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.is_admin_reply
                      ? 'bg-orange-500/10 border-l-4 border-blue-500 ml-8'
                      : 'bg-gray-50 border-l-4 border-gray-300 mr-8'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white font-bold">
                        {message.author_name || message.author_email || 'Unknown'}
                        {message.is_admin_reply && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            ADMIN
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-white font-bold whitespace-pre-wrap">{message.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reply to User
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
              disabled={sending}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
