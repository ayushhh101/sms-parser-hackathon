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
import * as smsService from '../smsService';
import { DEMO_SMS, DEMO_INSIGHTS } from '../demoData';

// Transaction Item Component
const TransactionItem = ({ transaction, index }) => {
  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'food delivery':
      case 'delivery':
        return { name: 'fast-food', color: '#F472B6' };
      case 'ride sharing':
      case 'transport':
        return { name: 'car', color: '#3B82F6' };
      case 'payment':
      case 'wallet':
        return { name: 'wallet', color: '#10B981' };
      default:
        return { name: 'cash', color: '#F59E0B' };
    }
  };

  const icon = getIconForType(transaction.type);

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
          {transaction.merchant || transaction.type || 'Transaction'}
        </Text>
        <Text className="text-gray-400 text-sm">
          {transaction.time} • SMS Parsed
        </Text>
        {transaction.otp && (
          <Text className="text-yellow-400 text-xs mt-1">
            OTP: {transaction.otp}
          </Text>
        )}
      </View>
      <Text 
        className={`font-bold text-base ${
          transaction.amount && transaction.amount > 0 
            ? 'text-emerald-400' 
            : 'text-red-400'
        }`}
      >
        {transaction.amount 
          ? (transaction.amount > 0 ? '+₹' : '-₹') + Math.abs(transaction.amount)
          : '₹0'}
      </Text>
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

  useEffect(() => {
    loadTransactions();
  }, []);

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
    } catch (error) {
      console.error('Error loading real SMS:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setTransactions(DEMO_SMS);
    setInsights(DEMO_INSIGHTS);
    setIsDemoMode(true);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isDemoMode) {
      // Simulate fresh demo data
      setTimeout(() => {
        loadDemoData();
        setRefreshing(false);
      }, 1000);
    } else {
      await loadRealSMS();
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
          <Text className="text-white text-xl font-bold">SMS Parser</Text>
          {isDemoMode && (
            <Text className="text-yellow-400 text-xs">Demo Mode</Text>
          )}
        </View>
        <TouchableOpacity onPress={loadTransactions}>
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
                {transactions.filter(t => t.amount > 0).length}
              </Text>
              <Text className="text-gray-500 text-xs">Earnings</Text>
            </View>
            <View className="items-center">
              <Text className="text-yellow-400 font-bold text-xl">
                {transactions.filter(t => t.otp).length}
              </Text>
              <Text className="text-gray-500 text-xs">OTPs Found</Text>
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-bold text-lg">Recent Transactions</Text>
          <Text className="text-emerald-500 text-sm">
            {isDemoMode ? 'Demo Data' : 'Live Data'}
          </Text>
        </View>

        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <TransactionItem 
              key={index} 
              transaction={transaction} 
              index={index} 
            />
          ))
        ) : (
          <View className="items-center py-10">
            <MaterialCommunityIcons name="message-text" size={48} color="#666" />
            <Text className="text-gray-500 text-lg mt-4">No SMS found</Text>
            <Text className="text-gray-600 text-sm mt-2 text-center">
              Grant SMS permission to analyze your financial messages
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}