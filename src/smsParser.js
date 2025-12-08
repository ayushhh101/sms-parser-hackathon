// SMS Parser - Extract OTPs and Transaction Details

// OTP patterns
const OTP_PATTERNS = [
  /\b(\d{4,8})\b.*(?:otp|code|pin|password|verification)/i,
  /(?:otp|code|pin|password|verification).*\b(\d{4,8})\b/i,
  /\b(\d{6})\b\s*(?:is your|is the)/i,
  /(?:use|enter|type)\s*(\d{4,8})\b/i,
  /(?:OTP|CVV|PIN|code)[\s:]+(\d{4,8})\b/i,
];

// Amount patterns
const AMOUNT_PATTERNS = [
  /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{2})?)/gi,
  /([\d,]+(?:\.\d{2})?)\s*(?:rs\.?|inr|₹)/gi,
  /(?:debited|credited|paid|received)[\s:]*(?:rs\.?|inr|₹)?\s*([\d,]+)/gi,
];

// Keywords for transaction types
const DEBIT_WORDS = ['debited', 'debit', 'spent', 'paid', 'payment', 'purchase', 'sent', 'withdrawn'];
const CREDIT_WORDS = ['credited', 'credit', 'received', 'refund', 'deposited', 'added'];
const CASHBACK_WORDS = ['cashback', 'cash back', 'reward', 'bonus'];

// Category keywords mapping (MongoDB categories: food, transport, recharge, entertainment, medical, send_home, miscellaneous)
const CATEGORY_KEYWORDS = {
  food: ['zomato', 'swiggy', 'dunzo', 'restaurant', 'cafe', 'food', 'eatery', 'dining', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'pizza', 'burger', 'dominos', 'mcdonalds', 'kfc', 'subway'],
  transport: ['uber', 'ola', 'rapido', 'auto', 'taxi', 'cab', 'metro', 'bus', 'train', 'irctc', 'railway', 'flight', 'petrol', 'diesel', 'fuel', 'gas', 'parking'],
  recharge: ['recharge', 'prepaid', 'postpaid', 'mobile', 'airtel', 'jio', 'vi', 'vodafone', 'idea', 'bsnl', 'dth', 'broadband', 'internet', 'data'],
  entertainment: ['netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube', 'movie', 'cinema', 'pvr', 'inox', 'game', 'gaming', 'entertainment', 'subscription', 'ott'],
  medical: ['hospital', 'clinic', 'doctor', 'pharmacy', 'medicine', 'medical', 'health', 'apollo', 'fortis', 'max', 'medlife', 'pharmeasy', '1mg', 'netmeds'],
  send_home: ['transfer', 'sent to', 'family', 'home', 'mother', 'father', 'parent', 'brother', 'sister', 'upi transfer'],
};

// Known senders/merchants with categories
const KNOWN_SENDERS = {
  'HDFCBK': { name: 'HDFC Bank', category: 'miscellaneous' },
  'SBIBNK': { name: 'SBI', category: 'miscellaneous' },
  'ICICIB': { name: 'ICICI Bank', category: 'miscellaneous' },
  'AXISBK': { name: 'Axis Bank', category: 'miscellaneous' },
  'PAYTM': { name: 'Paytm', category: 'miscellaneous' },
  'PHONEPE': { name: 'PhonePe', category: 'miscellaneous' },
  'GPAY': { name: 'Google Pay', category: 'miscellaneous' },
  'AMAZON': { name: 'Amazon', category: 'miscellaneous' },
  'FLIPKR': { name: 'Flipkart', category: 'miscellaneous' },
  'ZOMATO': { name: 'Zomato', category: 'food' },
  'SWIGGY': { name: 'Swiggy', category: 'food' },
  'UBER': { name: 'Uber', category: 'transport' },
  'OLA': { name: 'Ola', category: 'transport' },
  'RAPIDO': { name: 'Rapido', category: 'transport' },
  'IRCTC': { name: 'IRCTC', category: 'transport' },
  'AIRTEL': { name: 'Airtel', category: 'recharge' },
  'JIO': { name: 'Jio', category: 'recharge' },
  'VI': { name: 'Vi', category: 'recharge' },
  'APOLLO': { name: 'Apollo', category: 'medical' },
  'PHARMEASY': { name: 'PharmEasy', category: 'medical' },
  'NETFLIX': { name: 'Netflix', category: 'entertainment' },
  'PRIME': { name: 'Amazon Prime', category: 'entertainment' },
  'HOTSTAR': { name: 'Hotstar', category: 'entertainment' },
};

// Extract OTP from message
export const extractOTP = (message) => {
  for (const pattern of OTP_PATTERNS) {
    const match = message.match(pattern);
    if (match?.[1] && match[1].length >= 4 && match[1].length <= 8) {
      return match[1];
    }
  }
  return null;
};

// Extract amount from message
export const extractAmount = (message) => {
  for (const pattern of AMOUNT_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(message);
    if (match?.[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
};

// Detect transaction type
export const getTransactionType = (message) => {
  const lower = message.toLowerCase();
  if (CASHBACK_WORDS.some(w => lower.includes(w))) return 'cashback';
  if (DEBIT_WORDS.some(w => lower.includes(w))) return 'debit';
  if (CREDIT_WORDS.some(w => lower.includes(w))) return 'credit';
  return 'other';
};

// Extract balance
export const extractBalance = (message) => {
  const match = message.match(/(?:bal|balance|avl)[\s.:]*(?:rs\.?|inr|₹)?\s*([\d,]+)/i);
  if (match?.[1]) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return null;
};

// Extract account last 4 digits
export const extractAccount = (message) => {
  const match = message.match(/[xX*]+(\d{4})/);
  return match?.[1] || null;
};

// Extract percentage off
export const extractDiscount = (message) => {
  const match = message.match(/(\d+)\s*%\s*(?:off|discount|cashback)/i);
  return match ? parseInt(match[1]) : null;
};

// Categorize transaction based on message content and sender
export const categorizeTransaction = (message, sender) => {
  const lowerMessage = message.toLowerCase();
  const upperSender = sender.toUpperCase().replace(/[^A-Z]/g, '');
  
  // Check sender first
  for (const [key, info] of Object.entries(KNOWN_SENDERS)) {
    if (upperSender.includes(key)) {
      return info.category;
    }
  }
  
  // Check message content for category keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default to miscellaneous
  return 'miscellaneous';
};

// Get merchant/sender info
export const getMerchant = (sender, message) => {
  const upper = sender.toUpperCase().replace(/[^A-Z]/g, '');
  for (const [key, info] of Object.entries(KNOWN_SENDERS)) {
    if (upper.includes(key)) return info;
  }
  // Try to extract from message
  const merchantMatch = message.match(/(?:at|to|from|via)\s+([A-Za-z0-9\s]+?)(?:\s+on|\.|$)/i);
  if (merchantMatch?.[1]) {
    const merchantName = merchantMatch[1].trim();
    const category = categorizeTransaction(message, sender);
    return { name: merchantName, category };
  }
  return { name: sender, category: categorizeTransaction(message, sender) };
};

// Check if SMS is transactional
export const isTransactional = (message) => {
  const keywords = ['debited', 'credited', 'otp', 'code', 'payment', 'balance', 
    'transaction', 'rs', 'inr', '₹', 'upi', 'transfer', 'cashback'];
  const lower = message.toLowerCase();
  return keywords.some(k => lower.includes(k));
};

// Main parser function
export const parseSMS = (message, sender, timestamp = Date.now()) => {
  const otp = extractOTP(message);
  const merchant = getMerchant(sender, message);
  
  return {
    id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    sender,
    timestamp,
    isOTP: !!otp,
    otp,
    type: getTransactionType(message),
    amount: extractAmount(message),
    balance: extractBalance(message),
    account: extractAccount(message),
    discount: extractDiscount(message),
    merchant: merchant.name,
    category: merchant.category,
  };
};

// Format currency
export const formatMoney = (amount) => {
  if (!amount) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format time ago
export const timeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};