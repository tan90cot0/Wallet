/**
 * Card Utility Functions
 * Handles card validation, formatting, and network detection
 */

/**
 * Card network detection based on card number
 */
export const getCardNetwork = (cardNumber) => {
  // Remove spaces and non-digits
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Visa: starts with 4
  if (/^4/.test(cleanNumber)) {
    return 'visa';
  }
  
  // Mastercard: starts with 5 or 2221-2720
  if (/^5[1-5]/.test(cleanNumber) || /^222[1-9]|^22[3-9]|^2[3-6]|^27[01]|^2720/.test(cleanNumber)) {
    return 'mastercard';
  }
  
  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleanNumber)) {
    return 'amex';
  }
  
  // Discover: starts with 6
  if (/^6/.test(cleanNumber)) {
    return 'discover';
  }
  
  // RuPay: starts with 60, 65, 81, 82, 508
  if (/^(60|65|81|82|508)/.test(cleanNumber)) {
    return 'rupay';
  }
  
  // Diners Club: starts with 30, 36, 38
  if (/^3[0,6,8]/.test(cleanNumber)) {
    return 'diners';
  }
  
  // JCB: starts with 35
  if (/^35/.test(cleanNumber)) {
    return 'jcb';
  }
  
  return 'unknown';
};

/**
 * Get card network display name
 */
export const getCardNetworkName = (network) => {
  const names = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    rupay: 'RuPay',
    diners: 'Diners Club',
    jcb: 'JCB',
    unknown: 'Unknown',
  };
  
  return names[network] || 'Unknown';
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  
  // Remove non-digits
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Format with spaces after every 4 digits
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  return formatted;
};

/**
 * Mask card number for display (show only last 4 digits)
 */
export const maskCardNumber = (cardNumber, showLast = 4) => {
  if (!cardNumber) return '•••• •••• •••• ••••';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < showLast) {
    return '•'.repeat(16).replace(/(.{4})/g, '$1 ').trim();
  }
  
  const masked = '•'.repeat(cleaned.length - showLast) + cleaned.slice(-showLast);
  return formatCardNumber(masked);
};

/**
 * Validate card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Check minimum length
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate expiry date
 */
export const validateExpiryDate = (expiryDate) => {
  if (!expiryDate) return false;
  
  // Check format MM/YY
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!regex.test(expiryDate)) {
    return false;
  }
  
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
  const now = new Date();
  
  // Set to first day of current month for comparison
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  
  return expiry >= now;
};

/**
 * Validate CVV
 */
export const validateCVV = (cvv, cardNetwork = null) => {
  if (!cvv) return false;
  
  // Remove non-digits
  const cleaned = cvv.replace(/\D/g, '');
  
  // American Express CVV is 4 digits, others are 3
  if (cardNetwork === 'amex') {
    return cleaned.length === 4;
  }
  
  return cleaned.length === 3;
};

/**
 * Validate cardholder name
 */
export const validateCardholderName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  // Remove extra spaces and check minimum length
  const trimmed = name.trim();
  
  // Must be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes
  const regex = /^[a-zA-Z\s\-']{2,}$/;
  
  return regex.test(trimmed) && trimmed.length >= 2;
};

/**
 * Validate PIN
 */
export const validatePIN = (pin) => {
  if (!pin) return false;
  
  // Remove non-digits
  const cleaned = pin.replace(/\D/g, '');
  
  // Must be exactly 4 digits
  return cleaned.length === 4;
};

/**
 * Format expiry date as user types
 */
export const formatExpiryDate = (text) => {
  // Remove non-digits
  const cleaned = text.replace(/\D/g, '');
  
  // Format as MM/YY
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  }
  
  return cleaned;
};

/**
 * Get card type based on number (for UI styling)
 */
export const getCardType = (cardNumber) => {
  const network = getCardNetwork(cardNumber);
  
  // Return specific styling info for different card types
  const cardTypes = {
    visa: {
      colors: ['#1A1F71', '#1A1F71'],
      textColor: '#FFFFFF',
    },
    mastercard: {
      colors: ['#EB001B', '#F79E1B'],
      textColor: '#FFFFFF',
    },
    amex: {
      colors: ['#006FCF', '#016FD0'],
      textColor: '#FFFFFF',
    },
    discover: {
      colors: ['#FF6000', '#FF6000'],
      textColor: '#FFFFFF',
    },
    rupay: {
      colors: ['#077B5A', '#0B9B5B'],
      textColor: '#FFFFFF',
    },
    diners: {
      colors: ['#0079BE', '#0079BE'],
      textColor: '#FFFFFF',
    },
    jcb: {
      colors: ['#0E4C96', '#0E4C96'],
      textColor: '#FFFFFF',
    },
    unknown: {
      colors: ['#6B7280', '#9CA3AF'],
      textColor: '#FFFFFF',
    },
  };
  
  return {
    network,
    ...cardTypes[network],
  };
};

/**
 * Get bank-specific colors
 */
export const getBankColors = (bankName) => {
  const bank = bankName.toLowerCase();
  
  const bankColors = {
    sbi: ['#1D4ED8', '#2563EB'],
    hdfc: ['#047857', '#059669'],
    icici: ['#B91C1C', '#DC2626'],
    axis: ['#9333EA', '#A855F7'],
    kotak: ['#DC2626', '#EF4444'],
    yes: ['#0EA5E9', '#0284C7'],
    pnb: ['#059669', '#10B981'],
    bob: ['#DC2626', '#F87171'],
    canara: ['#EA580C', '#F97316'],
    union: ['#7C3AED', '#8B5CF6'],
    dbs: ['#4338CA', '#4F46E5'],
    standard: ['#0F766E', '#14B8A6'],
    default: ['#6366F1', '#8B5FBF'],
  };
  
  // Check if bank name contains any known bank identifier
  for (const [key, colors] of Object.entries(bankColors)) {
    if (bank.includes(key)) {
      return colors;
    }
  }
  
  return bankColors.default;
};

/**
 * Generate random card number for testing (not for production)
 */
export const generateTestCardNumber = (network = 'visa') => {
  const prefixes = {
    visa: '4',
    mastercard: '5',
    amex: '34',
    discover: '6',
    rupay: '60',
  };
  
  const prefix = prefixes[network] || prefixes.visa;
  let number = prefix;
  
  // Generate random digits
  while (number.length < 15) {
    number += Math.floor(Math.random() * 10);
  }
  
  // Calculate check digit using Luhn algorithm
  let sum = 0;
  let isEven = true;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return number + checkDigit;
};

/**
 * Check if card is expired
 */
export const isCardExpired = (expiryDate) => {
  if (!validateExpiryDate(expiryDate)) {
    return true;
  }
  
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
  const now = new Date();
  
  return expiry < now;
};

/**
 * Get months until expiry
 */
export const getMonthsUntilExpiry = (expiryDate) => {
  if (!validateExpiryDate(expiryDate)) {
    return -1;
  }
  
  const [month, year] = expiryDate.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
  const now = new Date();
  
  const diffTime = expiry - now;
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return Math.max(0, diffMonths);
};

export default {
  getCardNetwork,
  getCardNetworkName,
  formatCardNumber,
  maskCardNumber,
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  validateCardholderName,
  validatePIN,
  formatExpiryDate,
  getCardType,
  getBankColors,
  generateTestCardNumber,
  isCardExpired,
  getMonthsUntilExpiry,
};
