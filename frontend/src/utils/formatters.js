// Format currency (INR / USD style)
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

// Format distance nicely (accepts distance in kilometers or meters)
export const formatDistance = (val) => {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  const num = Number(val);
  if (num < 1) {
    return `${Math.round(num * 1000)} m`;
  }
  return `${num.toFixed(1)} km`;
};

// Format date time string
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate occupancy badge color scheme
export const getOccupancyStatus = (occupancyPercent) => {
  if (occupancyPercent >= 90) {
    return { label: 'Almost Full', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
  } else if (occupancyPercent >= 70) {
    return { label: 'Busy', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
  }
  return { label: 'Available', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
};
