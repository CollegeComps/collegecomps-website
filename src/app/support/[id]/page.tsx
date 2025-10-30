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
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-purple-600" />;
      case 'open':
        return <ExclamationCircleIcon className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/support"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to My Tickets
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || 'Ticket not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/support"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to My Tickets
        </Link>

        {/* Ticket Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(ticket.status)}
                <h1 className="text-2xl font-bold text-gray-900">
                  {ticket.subject || 'No Subject'}
                </h1>
              </div>
              <p className="text-gray-600">Ticket #{ticket.id}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket.priority || 'normal')}`}>
                {ticket.priority || 'normal'} priority
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status || 'open')}`}>
                {formatStatus(ticket.status)}
              </span>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium text-gray-900 capitalize">{formatCategory(ticket.category)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium text-gray-900">{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Original Description */}
          <div className="border-t mt-4 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Original Request:</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap">{ticket.description || 'No description provided'}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Conversation
          </h2>

          <div className="space-y-4 mb-6">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No messages yet. Our support team will respond soon!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.is_admin_reply
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50 border-l-4 border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {message.is_admin_reply ? 'Support Team' : 'You'}
                        {message.is_admin_reply && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            SUPPORT
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{message.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Reply Form - Only show if ticket is not closed */}
          {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
            <form onSubmit={handleSendReply} className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a Message
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={sending}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}

          {(ticket.status === 'closed' || ticket.status === 'resolved') && (
            <div className="border-t pt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">
                  This ticket has been {formatStatus(ticket.status)}
                </p>
                <p className="text-green-700 text-sm mt-1">
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
