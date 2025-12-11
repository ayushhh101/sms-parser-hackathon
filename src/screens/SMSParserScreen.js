import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/apiConfig';
import * as smsService from '../smsService';
import { DEMO_SMS_RAW } from '../demoData';
import { parseSMS } from '../smsParser';

// Transaction Item Component
const TransactionItem = ({ transaction, index }) => {
  const getIconForCategory = (category, type) => {
    switch (category?.toLowerCase()) {
      case 'food':
        return { name: 'food', color: '#F472B6' };
      case 'transport':
        return { name: 'car', color: '#3B82F6' };
      case 'recharge':
        return { name: 'cellphone', color: '#8B5CF6' };
      case 'entertainment':
        return { name: 'movie', color: '#EC4899' };
      case 'medical':
        return { name: 'medical-bag', color: '#EF4444' };
      case 'send_home':
        return { name: 'home-heart', color: '#10B981' };
      default:
        return type === 'credit' || type === 'cashback' 
          ? { name: 'cash-plus', color: '#10B981' }
          : { name: 'cash-minus', color: '#F59E0B' };
    }
  };

  const icon = getIconForCategory(transaction.category, transaction.type);
  
  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <View className="bg-[#1E293B] p-4 rounded-xl mb-3 flex-row items-center">
      <View 
        className="h-12 w-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${icon.color}20` }}
      >
        <MaterialCommunityIcons name={icon.name} size={24} color={icon.color} />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-base">
          {transaction.merchant || transaction.sender || 'Transaction'}
        </Text>
        <Text className="text-gray-400 text-sm">
          {formatTime(transaction.timestamp)} • {transaction.category || 'miscellaneous'}
        </Text>
        {transaction.otp && (
          <Text className="text-yellow-400 text-xs mt-1">
            OTP: {transaction.otp}
          </Text>
        )}
      </View>
      <View className="items-end">
        <Text 
          className={`font-bold text-base ${
            transaction.type === 'credit' || transaction.type === 'cashback'
              ? 'text-emerald-400' 
              : 'text-red-400'
          }`}
        >
          {transaction.amount 
            ? (transaction.type === 'credit' || transaction.type === 'cashback' ? '+₹' : '-₹') + transaction.amount.toFixed(0)
            : '₹0'}
        </Text>
        {transaction.balance && (
          <Text className="text-gray-500 text-xs">
            Bal: ₹{transaction.balance}
          </Text>
        )}
      </View>
    </View>
  );
};

export default function SMSParserScreen() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadUserAndTransactions();
  }, []);

  const loadUserAndTransactions = async () => {
    try {
      // Get userId from AsyncStorage
      const storedUserId = await AsyncStorage.getItem('userId');
      const currentUserId = storedUserId || 'usr_rahul_001';
      setUserId(currentUserId);
      
      // First try to load from backend
      await loadFromBackend(currentUserId);
    } catch (error) {
      console.error('Error loading user:', error);
      setUserId('usr_rahul_001');
      await loadFromBackend('usr_rahul_001');
    }
  };

  // Fetch transactions from backend
  const loadFromBackend = async (currentUserId) => {
    try {
      setLoading(true);
      
      const url = getApiUrl(`/transactions/user/${currentUserId}?limit=100`);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.transactions && data.transactions.length > 0) {
        // Convert backend transactions to display format
        const formattedTransactions = data.transactions.map(t => ({
          id: t.txId || t._id,
          message: t.description || t.notes || '',
          sender: t.merchant || 'Transaction',
          timestamp: new Date(t.timestamp).getTime(),
          isOTP: false,
          otp: null,
          type: t.type === 'income' ? 'credit' : 'debit',
          amount: t.amountPaise / 100, // Convert paise to rupees
          balance: null,
          account: null,
          discount: null,
          merchant: t.merchant || 'Unknown',
          category: t.category || 'miscellaneous',
        }));
        
        setTransactions(formattedTransactions);
        setInsights(calculateInsights(formattedTransactions));
        setIsDemoMode(false);
        console.log(`✅ Loaded ${formattedTransactions.length} transactions from backend`);
      } else {
        // No transactions found, parse and save SMS
        console.log('No transactions found in backend, parsing SMS...');
        await loadTransactions();
      }
    } catch (error) {
      console.error('Error loading from backend:', error);
      // Fallback to SMS parsing
      await loadTransactions();
    } finally {
      setLoading(false);
    }
  };

  // Calculate insights from transactions
  const calculateInsights = (txns) => {
    const earned = txns
      .filter(t => t.type === 'credit' || t.type === 'cashback')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const spent = txns
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = earned - spent;
    const savingsRate = earned > 0 ? ((balance / earned) * 100).toFixed(0) : 0;
    
    let summary = '';
    if (balance > 0) {
      summary = `🎉 Great work! You've saved ₹${balance.toFixed(0)} (${savingsRate}% of earnings). Keep it up!`;
    } else if (balance === 0) {
      summary = `💰 You've balanced your income and expenses perfectly this period.`;
    } else {
      summary = `⚠️ You've spent ₹${Math.abs(balance).toFixed(0)} more than earned. Consider reducing expenses.`;
    }
    
    return {
      summary,
      totalEarned: earned.toFixed(0),
      totalSpent: spent.toFixed(0),
      totalTransactions: txns.length,
    };
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Check SMS permissions
      const hasPermission = await smsService.checkPermissions();
      
      if (!hasPermission) {
        Alert.alert(
          "SMS Permission Required",
          "This app needs SMS permission to analyze your financial messages.",
          [
            {
              text: "Use Demo Mode",
              onPress: () => loadDemoData(),
            },
            {
              text: "Grant Permission",
              onPress: async () => {
                const granted = await smsService.requestPermissions();
                if (granted) {
                  loadRealSMS();
                } else {
                  loadDemoData();
                }
              },
            },
          ]
        );
        return;
      }

      await loadRealSMS();
    } catch (error) {
      console.error('Error loading transactions:', error);
      loadDemoData();
    }
  };

  const loadRealSMS = async () => {
    try {
      const smsData = await smsService.fetchSMS();
      setTransactions(smsData);
      setIsDemoMode(false);
      
      // Auto-save parsed SMS to backend
      const currentUserId = userId || 'usr_rahul_001';
      await smsService.batchSaveSMS(smsData, currentUserId);
      console.log('\u2705 Real SMS transactions saved to backend');
    } catch (error) {
      console.error('Error loading real SMS:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = async () => {
    try {
      // Parse demo SMS data
      const parsedDemoSMS = DEMO_SMS_RAW.map(sms => 
        parseSMS(sms.body, sms.sender, sms.timestamp)
      );
      
      setTransactions(parsedDemoSMS);
      setInsights(calculateInsights(parsedDemoSMS));
      setIsDemoMode(true);
      
      // Auto-save demo transactions to backend
      const currentUserId = userId || 'usr_rahul_001';
      await smsService.batchSaveSMS(parsedDemoSMS, currentUserId);
      console.log('✅ Demo SMS transactions saved to backend');
      
      // Reload from backend to show saved data
      setTimeout(() => loadFromBackend(currentUserId), 1000);
    } catch (error) {
      console.error('Error processing demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const currentUserId = userId || 'usr_rahul_001';
      // Always try to load from backend first
      await loadFromBackend(currentUserId);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F172A] justify-center items-center">
        <ActivityIndicator size="large" color="#6d4cff" />
        <Text className="text-white text-lg mt-4">Analyzing SMS Messages...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-4 mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-white text-xl font-bold">SMS Transactions</Text>
          <Text className="text-emerald-400 text-xs">
            {isDemoMode ? 'Demo Data Saved' : 'Backend Data'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Insights Card */}
        {insights && (
          <View className="bg-[#1E293B] rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="lightbulb" size={24} color="#F59E0B" />
              <Text className="text-white font-bold text-lg ml-2">AI Insights</Text>
            </View>
            <Text className="text-gray-300 text-sm leading-6 mb-3">
              {insights.summary}
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-emerald-400 font-bold text-lg">
                  ₹{insights.totalEarned}
                </Text>
                <Text className="text-gray-500 text-xs">Earned</Text>
              </View>
              <View className="items-center">
                <Text className="text-red-400 font-bold text-lg">
                  ₹{insights.totalSpent}
                </Text>
                <Text className="text-gray-500 text-xs">Spent</Text>
              </View>
              <View className="items-center">
                <Text className="text-blue-400 font-bold text-lg">
                  {insights.totalTransactions}
                </Text>
                <Text className="text-gray-500 text-xs">Messages</Text>
              </View>
            </View>
          </View>
        )}

        {/* Statistics */}
        <View className="bg-[#1E293B] rounded-2xl p-5 mb-6">
          <Text className="text-white font-bold text-lg mb-4">Quick Stats</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white font-bold text-xl">
                {transactions.length}
              </Text>
              <Text className="text-gray-500 text-xs">Total SMS</Text>
            </View>
            <View className="items-center">
              <Text className="text-emerald-400 font-bold text-xl">
                {transactions.filter(t => t.type === 'credit' || t.type === 'cashback').length}
              </Text>
              <Text className="text-gray-500 text-xs">Income</Text>
            </View>
            <View className="items-center">
              <Text className="text-red-400 font-bold text-xl">
                {transactions.filter(t => t.type === 'debit').length}
              </Text>
              <Text className="text-gray-500 text-xs">Expenses</Text>
            </View>
            <View className="items-center">
              <Text className="text-yellow-400 font-bold text-xl">
                {transactions.filter(t => t.otp).length}
              </Text>
              <Text className="text-gray-500 text-xs">OTPs</Text>
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-bold text-lg">Recent Transactions</Text>
          <TouchableOpacity 
            onPress={async () => {
              // Parse and save demo SMS if no transactions
              if (transactions.length === 0) {
                await loadDemoData();
              }
            }}
          >
            <Text className="text-emerald-500 text-sm">
              {transactions.length > 0 ? `${transactions.length} SMS` : 'Load Demo'}
            </Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <TransactionItem 
              key={transaction.id || index} 
              transaction={transaction} 
              index={index} 
            />
          ))
        ) : (
          <View className="items-center py-10">
            <MaterialCommunityIcons name="message-text" size={48} color="#666" />
            <Text className="text-gray-500 text-lg mt-4">No Transactions Found</Text>
            <Text className="text-gray-600 text-sm mt-2 text-center">
              Tap "Load Demo" above to parse sample SMS messages
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}