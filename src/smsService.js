import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import SmsListener from 'react-native-android-sms-listener';
import { parseSMS } from './smsParser';

// Request SMS permissions
export const requestPermissions = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission Required',
        message: 'This app needs access to your SMS to detect OTPs and transactions',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

// Check if permission is already granted
export const checkPermissions = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );
    return granted;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

// Read all SMS messages
export const fetchSMS = async ({ maxCount = 100 } = {}) => {
  return new Promise((resolve, reject) => {
    const filter = {
      box: 'inbox',
      maxCount,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.log('Failed to read SMS:', fail);
        reject(fail);
      },
      (count, smsList) => {
        try {
          const messages = JSON.parse(smsList);
          const parsedMessages = messages
            .map(sms => {
              const parsed = parseSMS(sms.body, sms.address, sms.date);
              return parsed ? { ...parsed, id: sms._id } : null;
            })
            .filter(msg => msg !== null)
            .sort((a, b) => b.timestamp - a.timestamp);

          resolve(parsedMessages);
        } catch (err) {
          console.log('Error parsing SMS:', err);
          reject(err);
        }
      }
    );
  });
};

// Listen for incoming SMS
export const startSmsListener = (onNewSMS) => {
  const subscription = SmsListener.addListener(message => {
    const parsed = parseSMS(message.body, message.originatingAddress, Date.now());
    if (parsed) {
      onNewSMS(parsed);
    }
  });

  return subscription;
};

// Calculate stats from transactions
export const getStats = (transactions) => {
  const stats = {
    totalIn: 0,
    totalOut: 0,
    totalCashback: 0,
    count: transactions.length,
  };

  transactions.forEach(tx => {
    if (tx.amount) {
      if (tx.type === 'credit') {
        stats.totalIn += tx.amount;
      } else if (tx.type === 'debit') {
        stats.totalOut += tx.amount;
      } else if (tx.type === 'cashback') {
        stats.totalCashback += tx.amount;
      }
    }
  });

  return stats;
};

// Filter transactions by type
export const filterTransactions = (transactions, filterType) => {
  switch (filterType) {
    case 'Debits':
      return transactions.filter(tx => tx.type === 'debit');
    case 'Credits':
      return transactions.filter(tx => tx.type === 'credit' || tx.type === 'cashback');
    case 'OTPs':
      return transactions.filter(tx => tx.isOTP);
    default:
      return transactions;
  }
};

// Save parsed SMS transaction to backend
export const saveSMSToBackend = async (parsedSMS, userId) => {
  try {
    // Import getApiUrl dynamically
    const { getApiUrl } = require('./utils/apiConfig');
    
    // Skip if it's just an OTP without transaction
    if (parsedSMS.isOTP && !parsedSMS.amount) {
      console.log('Skipping OTP-only SMS:', parsedSMS.otp);
      return null;
    }

    // Skip if no amount
    if (!parsedSMS.amount) {
      console.log('Skipping SMS without amount');
      return null;
    }

    // Convert to backend transaction format
    const transactionType = parsedSMS.type === 'credit' || parsedSMS.type === 'cashback' ? 'income' : 'expense';
    
    const transaction = {
      txId: `sms_${parsedSMS.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      amountPaise: Math.round(parsedSMS.amount * 100), // Convert to paise
      type: transactionType,
      category: parsedSMS.category || 'miscellaneous',
      merchant: parsedSMS.merchant || parsedSMS.sender,
      description: parsedSMS.message?.substring(0, 200) || 'SMS transaction',
      timestamp: new Date(parsedSMS.timestamp),
      source: 'sms',
      metadata: {
        sender: parsedSMS.sender,
        balance: parsedSMS.balance,
        account: parsedSMS.account,
        rawMessage: parsedSMS.message
      }
    };

    // Send to backend
    const url = getApiUrl('/transactions');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Transaction saved:', transaction.txId, '₹' + parsedSMS.amount);
      return result.transaction;
    } else {
      console.error('❌ Failed to save transaction:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error saving SMS to backend:', error);
    return null;
  }
};

// Batch save multiple transactions
export const batchSaveSMS = async (parsedSMSArray, userId) => {
  const results = [];
  for (const sms of parsedSMSArray) {
    const result = await saveSMSToBackend(sms, userId);
    if (result) {
      results.push(result);
    }
  }
  console.log(`💾 Saved ${results.length}/${parsedSMSArray.length} transactions to backend`);
  return results;
};
