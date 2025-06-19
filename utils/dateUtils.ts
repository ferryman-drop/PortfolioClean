// Utility function to format dates consistently across server and client
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Alternative format for different locales
export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Utility function to format numbers consistently across server and client
export const formatNumber = (num: number): string => {
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(1)}T`;
  } else if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(1)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(1)}M`;
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(1)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
};

// Format number with commas for thousands
export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format currency consistently
export const formatCurrency = (num: number): string => {
  return `$${formatNumberWithCommas(Math.round(num))}`;
}; 