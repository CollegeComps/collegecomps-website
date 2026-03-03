/**
 * Shared formatting utilities — single source of truth.
 * Import from here instead of defining locally in page components.
 */

/** Format a dollar amount as USD with no decimal places. */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Map IPEDS control_public_private code to a human-readable label. */
export function getControlTypeLabel(control?: number | null): string {
  switch (control) {
    case 1: return 'Public';
    case 2: return 'Private Non-profit';
    case 3: return 'Private For-profit';
    default: return 'Unknown';
  }
}

/** Format an ISO date string as a locale-friendly date. */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format an ISO date string with time. */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
