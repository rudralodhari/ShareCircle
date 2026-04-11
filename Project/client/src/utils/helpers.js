/**
 * Format a price with currency symbol
 */
export function formatPrice(amount, currency = '₹') {
  if (amount === 0 || amount == null) return 'Free';
  return `${currency}${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Format a date to relative time (e.g. "2 hours ago")
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

/**
 * Truncate text to specified length
 */
export function truncate(str, maxLength = 100) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + '…';
}

/**
 * Get user initials
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get the transaction type badge color
 */
export function getTypeColor(type) {
  const colors = {
    buy: '#10B981',
    sell: '#14B8A6',
    rent: '#8B5CF6',
    borrow: '#3B82F6',
    share: '#F59E0B',
    exchange: '#EC4899',
    donate: '#EF4444',
  };
  return colors[type] || '#64748b';
}

/**
 * Generate a placeholder image URL
 */
export function placeholderImage(width = 400, height = 300) {
  return `https://placehold.co/${width}x${height}/10B981/ffffff?text=ShareCircle`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
