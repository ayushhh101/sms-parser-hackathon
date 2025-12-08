import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/apiConfig';

const MOCK_GOALS = [
  { id: 1, title: "Diwali Fund", target: 5000, saved: 2350, deadline_days: 23, icon: "fire", color: "#F97316", bg: "bg-[#431407]" },
  { id: 2, title: "Bike Service", target: 2000, saved: 1400, deadline_days: 8, icon: "motorbike", color: "#38BDF8", bg: "bg-[#0c4a6e]" }
];

const MOCK_HEATMAP = [
  { day: 1, income: 2500, expense: 500 },
  { day: 2, income: 2200, expense: 400 },
  { day: 3, income: 0, expense: 1500 },
  { day: 4, income: 1200, expense: 1100 },
  { day: 5, income: 1500, expense: 200 },
  { day: 6, income: 800, expense: 800 },
  { day: 7, income: 3000, expense: 100 },
  { day: 12, income: 0, expense: 2000 },
  { day: 15, income: 1800, expense: 500 },
  { day: 23, income: 5000, expense: 200 },
];

const MOCK_SHIFTS = [
  { id: 1, icon: "moon", title: "Saturday 7-10 PM", subtitle: "Peak dinner time", surge: 40, color: "#Facc15" },
  { id: 2, icon: "sunny", title: "Sunday 12-3 PM", subtitle: "Lunch rush", surge: 35, color: "#F97316" },
  { id: 3, icon: "partly-sunny", title: "Friday 6-9 PM", subtitle: "Weekend starts", surge: 28, color: "#F87171" }
];


const BudgetRow = ({ item }) => {
  const progress = Math.min((item.spent / item.limit) * 100, 100);
  const IconComponent = item.lib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
  
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <IconComponent name={item.icon} size={18} color={item.color} />
          <Text className="text-slate-300 ml-2 font-medium">{item.name}</Text>
        </View>
        <View className="flex-row"><Text className="text-white font-bold">₹{item.spent}</Text><Text className="text-slate-500 text-xs mt-1 ml-1">/ ₹{item.limit}</Text></View>
      </View>
      <View className="h-3 bg-slate-800 rounded-full overflow-hidden"><View style={{ width: `${progress}%`, backgroundColor: item.color }} className="h-full rounded-full" /></View>
    </View>
  );
};

const GoalCard = ({ item }) => {
  const progress = (item.saved / item.target) * 100;
  const remaining = item.target - item.saved;
  return (
    <View className={`p-4 rounded-2xl mb-4 border border-white/5 ${item.bg}`}>
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <View className="bg-white/10 p-2 rounded-full mr-3"><MaterialCommunityIcons name={item.icon} size={20} color={item.color} /></View>
          <View><Text className="text-white font-bold text-lg">{item.title}</Text><Text className="text-slate-400 text-xs">Target: ₹{item.target.toLocaleString()} • {item.deadline_days} days left</Text></View>
        </View>
        <Text style={{ color: item.color }} className="font-bold text-xl">₹{item.saved.toLocaleString()}</Text>
      </View>
      <View className="h-3 bg-black/30 rounded-full overflow-hidden mb-2"><View style={{ width: `${progress}%`, backgroundColor: item.color }} className="h-full rounded-full" /></View>
      <View className="flex-row justify-between"><Text style={{ color: item.color }} className="text-xs font-bold">{Math.round(progress)}% complete</Text><Text className="text-slate-400 text-xs">₹{remaining.toLocaleString()} remaining</Text></View>
    </View>
  );
};

const HeatmapGrid = ({ data }) => {
  const dataMap = {};
  data.forEach(item => dataMap[item.day] = item);
  const getColor = (day) => {
    const entry = dataMap[day];
    if (!entry) return 'bg-slate-800';
    if (entry.expense > entry.income) return 'bg-red-500';
    if (entry.income > (entry.expense * 2) + 500) return 'bg-emerald-500';
    return 'bg-amber-400';
  };
  return (
    <View className="bg-[#1E293B] p-4 rounded-3xl mb-6">
      <View className="flex-row justify-center space-x-4 mb-4">
        <View className="flex-row items-center"><View className="w-3 h-3 bg-emerald-500 rounded mr-2"/><Text className="text-slate-400 text-xs">High Profit</Text></View>
        <View className="flex-row items-center"><View className="w-3 h-3 bg-amber-400 rounded mr-2"/><Text className="text-slate-400 text-xs">Balanced</Text></View>
        <View className="flex-row items-center"><View className="w-3 h-3 bg-red-500 rounded mr-2"/><Text className="text-slate-400 text-xs">Loss</Text></View>
      </View>
      <View className="flex-row flex-wrap justify-between">
        {['S','M','T','W','T','F','S'].map((d, i) => <Text key={i} className="text-slate-500 w-[13%] text-center mb-2 font-bold">{d}</Text>)}
        <View className="w-[13%] aspect-square" /><View className="w-[13%] aspect-square" /><View className="w-[13%] aspect-square" /><View className="w-[13%] aspect-square" /><View className="w-[13%] aspect-square" />
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
          <View key={day} className={`w-[13%] aspect-square ${getColor(day)} rounded-md mb-2 items-center justify-center`}>
            <Text className={`font-bold text-xs ${getColor(day) === 'bg-slate-800' ? 'text-slate-600' : 'text-[#0F172A]'}`}>{day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const ShiftCard = ({ item }) => (
  <View className="bg-[#1E293B] p-4 rounded-2xl mb-3 flex-row items-center border border-slate-700/50">
    <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-3">
      <Ionicons name={item.icon} size={20} color={item.color} />
    </View>
    <View className="flex-1">
      <Text className="text-white font-bold text-base">{item.title}</Text>
      <Text className="text-slate-400 text-xs">{item.subtitle}</Text>
    </View>
    <View className="items-end">
      <Text className="text-emerald-400 font-bold text-base">+{item.surge}%</Text>
      <Text className="text-slate-500 text-[10px]">vs average</Text>
    </View>
  </View>
);

const GridItem = ({ icon, color, label }) => (
  <View className="bg-slate-800/50 p-3 rounded-xl flex-row items-center mb-3 w-[48%] border border-slate-700/50">
    <View style={{ backgroundColor: color + '20' }} className="p-1.5 rounded-md mr-2"><Ionicons name={icon} size={14} color={color} /></View>
    <Text className="text-slate-300 text-[10px] font-medium flex-1" numberOfLines={1}>{label}</Text>
  </View>
);


export default function GoalsScreen() {
  const [viewMode, setViewMode] = useState('Budget');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // --- DATA STATE ---
  const [budgetData, setBudgetData] = useState([]);
  const [overallMetrics, setOverallMetrics] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const userIdValue = userData.userId || userData._id;
        setUserId(userIdValue);
        fetchBudgetData(userIdValue);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  const fetchBudgetData = async (userIdValue) => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/weekly-budget/current/${userIdValue}`));
      const data = await response.json();

      if (data.success && data.data) {
        const categories = data.data.categories;
        setOverallMetrics(data.data.overallMetrics);

        // Map categories to UI format
        const categoryMapping = {
          food: { name: 'Food & Snacks', icon: 'fast-food', lib: 'Ionicons' },
          transport: { name: 'Transport', icon: 'bus', lib: 'Ionicons' },
          recharge: { name: 'Mobile Recharge', icon: 'cellphone', lib: 'MCI' },
          entertainment: { name: 'Entertainment', icon: 'game-controller', lib: 'Ionicons' },
          medical: { name: 'Medical', icon: 'medical', lib: 'Ionicons' },
          send_home: { name: 'Send Home', icon: 'home', lib: 'Ionicons' },
          miscellaneous: { name: 'Miscellaneous', icon: 'cube', lib: 'Ionicons' }
        };

        const formattedBudgets = Object.entries(categories).map(([key, value], index) => {
          const spent = Math.floor(value.currentSpentPaise / 100);
          const limit = Math.floor(value.maxBudgetPaise / 100);
          const progress = limit > 0 ? (spent / limit) * 100 : 0;
          
          let color = '#10B981'; // green
          if (progress > 80) color = '#F97316'; // orange
          if (progress > 100) color = '#EF4444'; // red

          const mapping = categoryMapping[key] || { name: key, icon: 'cube', lib: 'Ionicons' };

          return {
            id: index + 1,
            name: mapping.name,
            icon: mapping.icon,
            lib: mapping.lib,
            spent: spent,
            limit: limit,
            color: color
          };
        });

        setBudgetData(formattedBudgets);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
      Alert.alert("Error", "Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    await fetchBudgetData(userId);
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      {/* TOGGLE HEADER */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row bg-[#1E293B] p-1 rounded-xl mb-4">
          <TouchableOpacity onPress={() => setViewMode('Budget')} className={`flex-1 py-2 rounded-lg items-center ${viewMode === 'Budget' ? 'bg-slate-700 shadow-sm' : ''}`}>
            <Text className={`font-bold ${viewMode === 'Budget' ? 'text-white' : 'text-slate-400'}`}>Smart Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('Insights')} className={`flex-1 py-2 rounded-lg items-center ${viewMode === 'Insights' ? 'bg-slate-700 shadow-sm' : ''}`}>
            <Text className={`font-bold ${viewMode === 'Insights' ? 'text-white' : 'text-slate-400'}`}>Earnings & Shifts</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        
        {/* LOADING SPINNER */}
        {loading && <ActivityIndicator size="large" color="#10B981" className="mb-4" />}

        {/*  BUDGET */}
        {viewMode === 'Budget' && (
          <>
            {/* Overall Metrics Card */}
            {overallMetrics && (
              <View className="bg-[#172554] border border-blue-800 rounded-2xl p-4 mb-8 shadow-lg shadow-blue-900/20">
                <View className="flex-row items-start">
                  <View className="bg-blue-500 h-8 w-8 rounded-full items-center justify-center mr-3 mt-1">
                    <Ionicons name="stats-chart" size={18} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-100 font-bold text-base mb-1">Weekly Overview</Text>
                    <Text className="text-blue-200 text-xs leading-5">
                      Spent ₹{overallMetrics.totalSpent} of ₹{overallMetrics.totalBudget} ({Math.round(overallMetrics.utilizationPercent)}% utilized)
                    </Text>
                    {overallMetrics.riskScore > 0.7 && (
                      <View className="flex-row items-center mt-2 bg-red-900/50 self-start px-2 py-1 rounded-md">
                        <Ionicons name="warning" size={14} color="#F87171" />
                        <Text className="text-red-200 text-xs ml-1">High risk: {Math.round(overallMetrics.riskScore * 100)}%</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Weekly Budget */}
            <View className="bg-[#1E293B] rounded-3xl p-5 mb-8 shadow-lg">
              <Text className="text-white font-bold text-lg mb-6">This Week's Budget</Text>
              {budgetData.length > 0 ? (
                budgetData.map((item) => (
                  <BudgetRow key={item.id} item={item} />
                ))
              ) : (
                <Text className="text-slate-400 text-center py-4">No budget data available</Text>
              )}
            </View>

            {/* Savings Goals - Mock Data */}
            <Text className="text-white font-bold text-xl mb-4">Savings Goals</Text>
            {MOCK_GOALS.map((item) => (
              <GoalCard key={item.id} item={item} />
            ))}
          </>
        )}

        {/*  INSIGHTS */}
        {viewMode === 'Insights' && (
          <>
            <View className="mb-6"><Text className="text-white text-2xl font-bold">Cash Flow Heatmap</Text><Text className="text-slate-400 text-xs">See your money patterns</Text></View>
            
            {/* Heatmap - Mock Data */}
            <HeatmapGrid data={MOCK_HEATMAP} />

            <View className="bg-[#2E1065] p-5 rounded-3xl mb-8 border border-purple-500/30">
              <View className="flex-row items-center mb-4"><MaterialCommunityIcons name="star-four-points" size={16} color="#Facc15" style={{marginRight:6}} /><Text className="text-white font-bold">Your Best Earning Shifts</Text></View>
              
              {/* Best Shifts - Mock Data */}
              {MOCK_SHIFTS.map(shift => (
                <ShiftCard key={shift.id} item={shift} />
              ))}
            </View>
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}