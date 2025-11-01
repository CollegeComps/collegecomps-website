'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Ticket {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  subscription_tier: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
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

// Helper functions for safe formatting
const formatStatus = (status: string | undefined): string => {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ');
};

const formatCategory = (category: string | undefined): string => {
  if (!category) return 'Uncategorized';
  return category.replace(/_/g, ' ');
};

export default function TicketDetailPage() {
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
      router.push('/auth/signin?callbackUrl=/support');
    } else if (status === 'authenticated') {
      fetchTicketDetails();
    }
  }, [status, router, ticketId]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ticket');
      }

      setTicket(data.ticket);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
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
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setReplyText('');
      await fetchTicketDetails(); // Refresh to show new message
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900/20 border border-red-500 text-red-400';
      case 'normal': return 'bg-yellow-900/20 border border-yellow-500 text-yellow-400';
      case 'low': return 'bg-green-900/20 border border-green-500 text-green-400';
      default: return 'bg-gray-800 border border-gray-700 text-white font-bold';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-500/10 border border-orange-500 text-orange-400';
      case 'in_progress': return 'bg-orange-500/10 border border-orange-500 text-orange-400';
      case 'resolved': return 'bg-green-900/20 border border-green-500 text-green-400';
      case 'closed': return 'bg-gray-800 border border-gray-700 text-gray-300';
      default: return 'bg-gray-800 border border-gray-700 text-white font-bold';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-orange-500" />;
      case 'open':
        return <ExclamationCircleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
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
            href="/support"
            className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to My Tickets
          </Link>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-400 font-bold">{error || 'Ticket not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/support"
          className="inline-flex items-center text-orange-500 hover:text-orange-400 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to My Tickets
        </Link>

        {/* Ticket Header */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-orange-500/20 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.1)] mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(ticket.status)}
                <h1 className="text-2xl font-bold text-white">
                  {ticket?.subject || 'No Subject'}
                </h1>
              </div>
              <p className="text-gray-300">Ticket #{ticket?.id || 'N/A'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket?.priority || 'normal')}`}>
                {ticket?.priority || 'normal'} priority
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket?.status || 'open')}`}>
                {formatStatus(ticket?.status)}
              </span>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="border-t border-gray-700/50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Category</p>
              <p className="font-medium text-white capitalize">{formatCategory(ticket?.category)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Created</p>
              <p className="font-medium text-white">
                {ticket?.created_at ? new Date(ticket.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Date unavailable'}
              </p>
            </div>
          </div>

          {/* Original Description */}
          <div className="border-t border-gray-700/50 mt-4 pt-4">
            <p className="text-sm font-semibold text-gray-400 mb-2">Original Request:</p>
            <div className="bg-black/50 border border-gray-700/50 rounded-lg p-4">
              <p className="text-gray-200 whitespace-pre-wrap">{ticket?.description || 'No description provided'}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-orange-500/20 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.1)] mb-6 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-orange-500" />
            Conversation
          </h2>

          <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto pr-2">
            {!messages || messages.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No messages yet. Our support team will respond soon!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.is_admin_reply
                      ? 'bg-orange-500/10 border-l-4 border-orange-500'
                      : 'bg-black/50 border border-gray-700/50 border-l-4 border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {message.is_admin_reply ? 'Support Team' : (message.author_name || 'You')}
                        {message.is_admin_reply && (
                          <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                            SUPPORT
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {message.created_at ? new Date(message.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Date unavailable'}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-200 whitespace-pre-wrap">{message.message || 'No message content'}</p>
                </div>
              ))
            )}
          </div>

          {/* Reply Form - Only show if ticket is not closed */}
          {ticket?.status !== 'closed' && ticket?.status !== 'resolved' && (
            <form onSubmit={handleSendReply} className="border-t border-gray-700/50 pt-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Add a Message
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-700 bg-black/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                disabled={sending}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}

          {(ticket?.status === 'closed' || ticket?.status === 'resolved') && (
            <div className="border-t border-gray-700/50 pt-4">
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-400 font-semibold">
                  This ticket has been {formatStatus(ticket?.status)}
                </p>
                <p className="text-green-500 text-sm mt-1">
                  If you need further assistance, please create a new ticket.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
