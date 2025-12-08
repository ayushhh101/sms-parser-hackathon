import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, RefreshControl, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/apiConfig';

// --- MOCK DATA FOR CHALLENGES ---
const MOCK_CHALLENGES = [
  { id: 1, title: "Save ₹25 today", subtitle: "Put aside a small amount", amount: 25, type: 'active', icon: 'checkmark-circle', color: '#10B981', btnText: 'Done' },
  { id: 2, title: "Skip one food order", subtitle: "Cook at home or eat packed lunch", amount: 50, type: 'pending', icon: 'fast-food', color: '#F97316', btnText: 'Mark as Done' },
  { id: 3, title: "Use bus instead of auto", subtitle: "Save on transportation today", amount: 30, type: 'pending', icon: 'bus', color: '#3B82F6', btnText: 'Done' },
  { id: 4, title: "Festival jar deposit", subtitle: "Add to your Diwali fund", amount: 50, type: 'special', icon: 'gift', color: '#F59E0B', btnText: 'Add' },
];

const WEEKLY_PROGRESS = [
  { day: "Mon", status: "done" },
  { day: "Tue", status: "done" },
  { day: "Wed", status: "done" },
  { day: "Thu", status: "current" },
  { day: "Fri", status: "pending" },
  { day: "Sat", status: "pending" },
  { day: "Sun", status: "pending" },
];

// --- EXISTING MOCK DATA ---
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


// --- COMPONENT: Budget Row ---
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

// --- COMPONENT: Goal Card ---
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

// --- COMPONENT: Heatmap Grid ---
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

// --- COMPONENT: Shift Card ---
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

// --- COMPONENT: Challenge Card ---
const ChallengeCard = ({ item }) => {
  const isActive = item.type === 'active';
  
  return (
    <View className={`p-4 rounded-2xl mb-3 border ${isActive ? 'bg-[#064e3b] border-emerald-500/50' : 'bg-[#1E293B] border-slate-700/50'}`}>
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center flex-1 pr-2">
           <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
             <Ionicons name={item.icon} size={20} color={isActive ? "white" : item.color} />
           </View>
           <View className="flex-1">
             <Text className="text-white font-bold text-base">{item.title}</Text>
             <Text className="text-slate-400 text-xs">{item.subtitle}</Text>
           </View>
        </View>
        <View className="bg-white/10 px-2 py-1 rounded-lg">
          <Text className="text-white font-bold text-xs">+{item.amount}</Text>
        </View>
      </View>

      {/* Progress Bar or Action Button Area */}
      {isActive ? (
         <View className="mt-2 h-1.5 bg-emerald-900 rounded-full overflow-hidden">
            <View className="h-full bg-emerald-400 w-1/3 rounded-full" />
         </View>
      ) : (
        <TouchableOpacity className="mt-2 bg-slate-700/50 py-2 rounded-lg items-center border border-slate-600">
          <Text className="text-amber-500 font-bold text-xs">{item.btnText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- UPDATED COMPONENT: Jar Item (With Specific Amount Button) ---
const JarItem = ({ item }) => {
  if (item.isAdd) {
    return (
      <TouchableOpacity className="w-[48%] bg-[#1E293B] aspect-[0.85] rounded-2xl border-2 border-dashed border-slate-700 items-center justify-center mb-4">
        <View className="w-12 h-12 rounded-full bg-slate-700 items-center justify-center mb-2">
          <Ionicons name="add" size={24} color="#94A3B8" />
        </View>
        <Text className="text-slate-500 font-medium">New Jar</Text>
      </TouchableOpacity>
    );
  }

  const progress = (item.saved / item.target) * 100;

  return (
    <View className={`w-[48%] ${item.bg} p-4 rounded-2xl mb-4`}>
      {/* Icon & Title */}
      <View className="items-center mb-2">
        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} style={{marginBottom: 8}} />
        <Text className="text-white font-bold text-base text-center" numberOfLines={1}>{item.title}</Text>
        <Text className="text-white font-bold text-xl my-1">₹{item.saved}</Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-3">
        <View className="h-2 bg-black/20 rounded-full overflow-hidden mb-1">
          <View style={{ width: `${progress}%`, backgroundColor: item.color }} className="h-full rounded-full" />
        </View>
        <Text className="text-slate-300 text-[10px] text-center">{Math.round(progress)}% of ₹{item.target}</Text>
      </View>

      {/* UPDATED: Button shows the specific amount calculated from backend */}
      <TouchableOpacity 
        className="bg-black/20 py-2.5 rounded-xl flex-row items-center justify-center border border-white/10"
        onPress={() => Alert.alert("Deposit", `Add ₹${item.suggested_amt} to ${item.title}`)}
      >
        <Ionicons name="add" size={16} color="white" style={{marginRight: 2}} />
        <Text className="text-white text-xs font-bold">Add ₹{item.suggested_amt}</Text>
      </TouchableOpacity>
    </View>
  );
}


export default function GoalsScreen() {
  const [viewMode, setViewMode] = useState('Budget'); // 'Budget', 'Challenges', 'Insights'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // --- DATA STATE ---
  const [budgetData, setBudgetData] = useState([]);
  const [overallMetrics, setOverallMetrics] = useState(null);
  const [jarsData,setJarsData] = useState([]);

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
        fetchJarsData(userIdValue);
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

  const fetchJarsData = async (userIdValue) => {
    try {
      // Assuming your route is /api/jars/:userId
      const response = await fetch(getApiUrl(`/jars/${userIdValue}`));
      const data = await response.json();

      if (data.success && data.data) {
        // We append the "New Jar" button logic here locally so the UI renders it last
        const jarsWithAddButton = [
          ...data.data, 
          { id: 'add-new', isAdd: true } // Dummy item for the "+" button
        ];
        setJarsData(jarsWithAddButton);
      }
    } catch (error) {
      console.error("Error fetching jars:", error);
    }
  };


  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    await Promise.all([
      fetchBudgetData(userId),
      fetchJarsData(userId) // <--- ADD THIS
    ]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      {/* 3-WAY TOGGLE HEADER */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row bg-[#1E293B] p-1 rounded-xl mb-4">
          <TouchableOpacity onPress={() => setViewMode('Budget')} className={`flex-1 py-2 rounded-lg items-center ${viewMode === 'Budget' ? 'bg-slate-700 shadow-sm' : ''}`}>
            <Text className={`font-bold text-sm ${viewMode === 'Budget' ? 'text-white' : 'text-slate-400'}`}>Smart Budget</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setViewMode('Challenges')} className={`flex-1 py-2 rounded-lg items-center ${viewMode === 'Challenges' ? 'bg-slate-700 shadow-sm' : ''}`}>
            <Text className={`font-bold text-sm ${viewMode === 'Challenges' ? 'text-emerald-400' : 'text-slate-400'}`}>Challenges</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setViewMode('Insights')} className={`flex-1 py-2 rounded-lg items-center ${viewMode === 'Insights' ? 'bg-slate-700 shadow-sm' : ''}`}>
            <Text className={`font-bold text-sm ${viewMode === 'Insights' ? 'text-white' : 'text-slate-400'}`}>Shifts</Text>
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

        {/* ----------------- VIEW 1: BUDGET ----------------- */}
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

        {/* ----------------- VIEW 2: CHALLENGES ----------------- */}
        {viewMode === 'Challenges' && (
          <>
             {/* Header Section */}
             <View className="flex-row justify-between items-center mb-4">
                <View>
                   <Text className="text-white font-bold text-2xl">Daily Challenges</Text>
                   <Text className="text-slate-400 text-xs">Small steps, big results 💪</Text>
                </View>
                <TouchableOpacity className="bg-slate-800 p-2 rounded-full">
                   <Ionicons name="information-circle-outline" size={24} color="#94A3B8" />
                </TouchableOpacity>
             </View>

             {/* Green Stats Card */}
             <View className="bg-[#10B981] rounded-3xl p-6 mb-6">
                <Text className="text-emerald-900 font-medium mb-1">Total Saved This Month</Text>
                <Text className="text-white font-bold text-4xl mb-4">₹1,450</Text>
                <View className="flex-row gap-3">
                   <View className="bg-emerald-800/20 px-3 py-1.5 rounded-lg flex-row items-center border border-emerald-400/30">
                      <Ionicons name="trophy" size={14} color="#FFD700" style={{marginRight: 6}} />
                      <Text className="text-white text-xs font-bold">12 challenges done</Text>
                   </View>
                   <View className="bg-emerald-800/20 px-3 py-1.5 rounded-lg flex-row items-center border border-emerald-400/30">
                      <Ionicons name="flame" size={14} color="#FB923C" style={{marginRight: 6}} />
                      <Text className="text-white text-xs font-bold">5 day streak</Text>
                   </View>
                </View>
             </View>

             {/* Today's Challenges */}
             <View className="flex-row justify-between items-end mb-4">
                <View className="flex-row items-center">
                   <MaterialCommunityIcons name="fire" size={20} color="#F97316" />
                   <Text className="text-white font-bold text-lg ml-2">Today's Challenges</Text>
                </View>
                <View className="bg-slate-800 px-2 py-1 rounded-md">
                  <Text className="text-slate-400 text-xs">4 tasks</Text>
                </View>
             </View>

             <View className="mb-8">
               {MOCK_CHALLENGES.map(item => <ChallengeCard key={item.id} item={item} />)}
             </View>

             {/* Savings Jars Grid */}
             <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons name="gift-outline" size={20} color="#F472B6" />
                <Text className="text-white font-bold text-lg ml-2">Savings Jars</Text>
             </View>

             <View className="flex-row flex-wrap justify-between mb-6">
                {jarsData.map(jar => <JarItem key={jar.id} item={jar} />)}
             </View>

             {/* Weekly Progress */}
             <View className="bg-[#1E293B] p-5 rounded-2xl mb-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="star-outline" size={20} color="#FBBF24" />
                  <Text className="text-white font-bold text-lg ml-2">This Week's Progress</Text>
                </View>

                <View className="flex-row justify-between mb-6 px-2">
                  {WEEKLY_PROGRESS.map((day, idx) => (
                    <View key={idx} className="items-center">
                      <View className={`w-8 h-8 rounded-full items-center justify-center mb-2 
                        ${day.status === 'done' ? 'bg-[#10B981]' : day.status === 'current' ? 'bg-orange-500' : 'bg-slate-700/50 border border-slate-600'}`}>
                        {day.status === 'done' && <Ionicons name="checkmark" size={16} color="white" />}
                        {day.status === 'current' && <Ionicons name="flame" size={16} color="white" />}
                      </View>
                      <Text className="text-slate-500 text-[10px]">{day.day}</Text>
                    </View>
                  ))}
                </View>

                <View className="bg-[#10B981]/10 py-3 rounded-xl border border-[#10B981]/20 flex-row justify-center items-center">
                   <Text className="text-[#10B981] text-xs font-bold">🔥 3 day streak! Keep going for bonus rewards!</Text>
                </View>
             </View>
          </>
        )}

        {/* ----------------- VIEW 3: INSIGHTS ----------------- */}
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