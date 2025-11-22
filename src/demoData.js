// Demo SMS data for gig workers hackathon presentation
// Simulates real-world SMS patterns for delivery riders, drivers, etc.

export const DEMO_SMS = [
  // ===== EARNINGS (Swiggy, Zomato, Uber, etc.) =====
  {
    sender: 'SWIGGY',
    body: 'Payout of Rs.487 credited to A/c XX45 on 21-Nov. Ref: SWG123456. Avl Bal: Rs.5420',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
  },

  // Earnings short form
  {
    sender: 'ZOMATO',
    body: 'Payment received: Rs.620 (8 orders). Weekend bonus Rs.80. Total payout credited.',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
  },

  // Bank debit with mask and ATM
  {
    sender: 'HDFCBK',
    body: 'INR 2,500 debited from A/c XX1234 on 21-Nov. ATM Withdrawal. Avl Bal: INR 8,750',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
  },

  // Fuel expense with POS ref
  {
    sender: 'BPCL',
    body: 'Txn of ₹500 at BPCL Pump #2341. POS Ref: 54321. Avl Bal: ₹3,200',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
  },

  // UPI payment with UPI ref
  {
    sender: 'GPAY',
    body: 'Rs.85 paid to Street Food Corner. UPI Ref: 534289123. Payment successful.',
    timestamp: Date.now() - 18 * 60 * 60 * 1000,
  },

  // OTP — plain
  {
    sender: 'PAYTM',
    body: 'OTP: 123456 to verify payment of Rs.500. Expires in 5 mins.',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
  },

  // OTP — with SMS Retriever hash (realistic example)
  {
    sender: 'SWIGGY',
    body: '<#> Your OTP is 654321 for Swiggy login. AbCdEfGhIjK',
    timestamp: Date.now() - 10 * 60 * 1000,
  },

  // Hinglish casual payment
  {
    sender: 'PAYTM',
    body: 'Rs.180 pay kiya Chai Wala - Dadar. Dhanyavaad!',
    timestamp: Date.now() - 12 * 60 * 60 * 1000,
  },

  // Cashback / reward message
  {
    sender: 'FLIPKRT',
    body: 'Cashback Rs.89 credited for Order #FK4893021. Use within 30 days.',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },

  // Weekly summary (platform)
  {
    sender: 'SWIGGY',
    body: 'Weekly Report: You completed 42 orders and earned Rs.3850 this week. Top performer bonus: Rs.200',
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },

  // Failed / pending payment (edge case)
  {
    sender: 'BANKALRT',
    body: 'Alert: Payment of Rs.1200 to Sharma Medical Store is pending. Please retry.',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },

  // EMI reminder (clear and urgent)
  {
    sender: 'BAJFIN',
    body: 'Reminder: EMI Rs.2,800 due on 25-Nov-2025 for Loan A/c XX98. Pay to avoid late fee.',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
];

// Generate random realistic demo SMS
export const generateRandomDemoSMS = () => {
  const templates = [
    // Earnings
    {
      sender: 'SWIGGY',
      template: (amt) => `You earned Rs.${amt} from ${Math.floor(amt / 80)} deliveries. Bonus: Rs.${Math.floor(amt * 0.1)}`,
    },
    {
      sender: 'ZOMATO',
      template: (amt) => `Payment of Rs.${amt} credited for ${Math.floor(amt / 75)} orders completed today.`,
    },
    {
      sender: 'UBER',
      template: (amt) => `Trip payment Rs.${amt} received. Distance: ${Math.floor(amt / 15)}km. Thanks!`,
    },
    // Expenses
    {
      sender: 'BPCL',
      template: (amt) => `Rs.${amt} debited for fuel. Balance: Rs.${Math.floor(Math.random() * 5000 + 2000)}`,
    },
    {
      sender: 'PAYTM',
      template: (amt) => `Rs.${amt} paid via UPI. Transaction successful.`,
    },
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  const amount = Math.floor(Math.random() * 500 + 100);
  
  return {
    sender: template.sender,
    body: template.template(amount),
    timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
  };
};

// Gig worker persona stories
export const GIG_WORKER_STORIES = {
  delivery_rider: {
    name: 'Rahul (Delivery Rider)',
    dailyEarnings: '₹400-600',
    challenges: ['Fuel costs', 'Weekend peaks', 'Rain days'],
    goals: ['Save ₹5000/month', 'Buy new phone', 'Send money home'],
  },
  auto_driver: {
    name: 'Suresh (Auto Driver)',
    dailyEarnings: '₹600-900',
    challenges: ['CNG prices', 'Traffic fines', 'Low morning rides'],
    goals: ['EMI payment', 'Daughter school fees', 'Festival savings'],
  },
  uber_driver: {
    name: 'Amit (Uber Driver)',
    dailyEarnings: '₹800-1200',
    challenges: ['Car maintenance', 'Surge timing', 'Fuel expenses'],
    goals: ['Car loan', 'Health insurance', 'Emergency fund ₹20k'],
  },
};

// Demo insights for presentation
export const DEMO_INSIGHTS = [
  {
    type: 'earning_spike',
    message: '🔥 You earned 32% more this weekend! Saturday 7-10 PM is your golden hour.',
    color: '#00b894',
  },
  {
    type: 'expense_alert',
    message: '⚠️ Fuel spending is 40% higher this week. Consider reducing 2 trips to save ₹180.',
    color: '#ff7675',
  },
  {
    type: 'goal_progress',
    message: '✨ You are 68% to your ₹5000 savings goal! Just ₹1600 more to go.',
    color: '#6c5ce7',
  },
  {
    type: 'cashback',
    message: '💰 You got ₹240 cashback this month. Use it for next recharge!',
    color: '#fdcb6e',
  },
  {
    type: 'shift_advice',
    message: '📊 Lunch shift (12-3 PM) gives you 28% better earnings. Try 2 more hours!',
    color: '#74b9ff',
  },
  {
    type: 'festival_prep',
    message: '🎊 Diwali in 2 weeks! Start saving ₹100/day for festival expenses.',
    color: '#fd79a8',
  },
];
