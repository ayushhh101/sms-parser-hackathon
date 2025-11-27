import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// =====================================================================
// 📦 1. MOCK DATA CONSTANTS (Default / Fallback Data)
// =====================================================================

const MOCK_ALERT = {
  active: true,
  title: "Budget Auto-Adjusted!",
  message: "Your income dropped 15% this week. Budget recalibrated automatically.",
  change: { category: "Food", old: 2000, new: 1700 }
};

const MOCK_BUDGETS = [
  { id: 1, name: "Food & Snacks", icon: "fast-food", lib: "Ionicons", spent: 1200, limit: 1700, color: "#F97316" },
  { id: 2, name: "Fuel", icon: "fuel", lib: "MCI", spent: 720, limit: 800, color: "#F97316" },
  { id: 3, name: "Mobile Recharge", icon: "cellphone", lib: "MCI", spent: 199, limit: 250, color: "#F97316" },
  { id: 4, name: "Transport", icon: "bus", lib: "Ionicons", spent: 120, limit: 300, color: "#10B981" },
  { id: 5, name: "Miscellaneous", icon: "cube", lib: "Ionicons", spent: 180, limit: 500, color: "#10B981" }
];

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

// =====================================================================
// 🧩 2. HELPER COMPONENTS
// =====================================================================

const BudgetRow = ({ item }) => {
  const progress = Math.min((item.spent / item.limit) * 100, 100);
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          {item.lib === 'Ionicons' && <Ionicons name={item.icon} size={18} color={item.color} />}
          {item.lib === 'MCI' && <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />}
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

// =====================================================================
// 🚀 3. MAIN SCREEN & CONNECTION LOGIC
// =====================================================================

export default function GoalsScreen() {
  const [viewMode, setViewMode] = useState('Budget');
  const [loading, setLoading] = useState(false);

  // --- DATA STATE (Initialized with MOCK data for now) ---
  const [alertData, setAlertData] = useState(MOCK_ALERT);
  const [budgetData, setBudgetData] = useState(MOCK_BUDGETS);
  const [goalsData, setGoalsData] = useState(MOCK_GOALS);
  const [heatmapData, setHeatmapData] = useState(MOCK_HEATMAP);
  const [shiftData, setShiftData] = useState(MOCK_SHIFTS);

  // --- 🔌 1. RECEIVE DATA (GET) ---
  useEffect(() => {
    // 👇 UNCOMMENT THIS ON SUNDAY TO FETCH DATA 👇
    /*
    const fetchGoalsData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://192.168.1.5:5000/api/goals-dashboard?userId=101');
        const data = await response.json();
        
        // Update state with Real Data
        if (data.alert) setAlertData(data.alert);
        if (data.budgets) setBudgetData(data.budgets);
        if (data.goals) setGoalsData(data.goals);
        if (data.heatmap) setHeatmapData(data.heatmap);
        if (data.shifts) setShiftData(data.shifts);
        
        console.log("✅ Goals Data Loaded Successfully");
      } catch (error) {
        console.error("❌ Failed to fetch Goals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoalsData();
    */
  }, []);

  // --- 🔌 2. SEND DATA (POST) ---
  const handleApplySuggestion = () => {
    const payload = {
      userId: "101",
      action: "APPLY_SUGGESTION",
      suggestionId: "weekend_hours",
      timestamp: new Date().toISOString()
    };

    console.log("🚀 APPLYING SUGGESTION:", JSON.stringify(payload, null, 2));

    // UNCOMMENT THIS ON SUNDAY TO SEND ACTION 
    /*
    fetch('http://192.168.1.5:5000/api/apply-suggestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => Alert.alert("Success", "Plan Updated! ✅"))
    .catch(err => Alert.alert("Error", "Backend offline"));
    */
    
    Alert.alert("Applying...", "Optimizing your schedule...");
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

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* LOADING SPINNER */}
        {loading && <ActivityIndicator size="large" color="#10B981" className="mb-4" />}

        {/*  BUDGET */}
        {viewMode === 'Budget' && (
          <>
            {/* Smart Alert */}
            {alertData && alertData.active && (
              <View className="bg-[#172554] border border-blue-800 rounded-2xl p-4 mb-8 shadow-lg shadow-blue-900/20">
                <View className="flex-row items-start">
                  <View className="bg-blue-500 h-8 w-8 rounded-full items-center justify-center mr-3 mt-1"><Ionicons name="flash" size={18} color="white" /></View>
                  <View className="flex-1">
                    <Text className="text-blue-100 font-bold text-base mb-1">{alertData.title}</Text>
                    <Text className="text-blue-200 text-xs leading-5">{alertData.message}</Text>
                    {alertData.change && (
                      <View className="flex-row items-center mt-2 bg-blue-900/50 self-start px-2 py-1 rounded-md">
                        <Ionicons name="trending-down" size={14} color="#F87171" />
                        <Text className="text-slate-300 text-xs ml-1">{alertData.change.category}: </Text>
                        <Text className="text-slate-400 text-xs line-through decoration-red-500">₹{alertData.change.old}</Text>
                        <Text className="text-white text-xs font-bold ml-1">→ ₹{alertData.change.new}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Weekly Budget */}
            <View className="bg-[#1E293B] rounded-3xl p-5 mb-8 shadow-lg">
              <Text className="text-white font-bold text-lg mb-6">This Week's Budget</Text>
              {budgetData.map((item) => (
                <BudgetRow key={item.id} item={item} />
              ))}
            </View>

            {/* Static Grid (UI Only) */}
            <View className="bg-[#1E293B] rounded-3xl p-5 mb-8">
              <View className="flex-row items-center mb-4"><Ionicons name="scan-circle" size={20} color="#10B981" style={{ marginRight: 8 }} /><Text className="text-white font-bold text-lg">Budget Adjusts Based On:</Text></View>
              <View className="flex-row flex-wrap justify-between">
                <GridItem icon="stats-chart" color="#A78BFA" label="Income Spikes" />
                <GridItem icon="trending-down" color="#F87171" label="Income Drops" />
                <GridItem icon="flame" color="#FBBF24" label="Festival Months" />
                <GridItem icon="card" color="#60A5FA" label="EMI Due Dates" />
              </View>
            </View>

            {/* Goals */}
            <Text className="text-white font-bold text-xl mb-4">Savings Goals</Text>
            {goalsData.map((item) => (
              <GoalCard key={item.id} item={item} />
            ))}

            {/* AI Recommendation */}
            <View className="bg-[#3B0764] border border-purple-500/30 p-5 rounded-2xl mb-10 mt-6">
              <View className="flex-row items-center mb-3">
                <Ionicons name="bulb" size={20} color="#Facc15" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg">AI Recommendation</Text>
              </View>
              <Text className="text-purple-100 text-sm leading-6 mb-4">
                Based on your pattern, adding 2 weekend hours can help you reach your Diwali goal 5 days early!
              </Text>
              <TouchableOpacity onPress={handleApplySuggestion} className="bg-[#7E22CE] py-3 rounded-xl items-center">
                <Text className="text-white font-bold">Apply Suggestion →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/*  INSIGHTS */}
        {viewMode === 'Insights' && (
          <>
            <View className="mb-6"><Text className="text-white text-2xl font-bold">Cash Flow Heatmap</Text><Text className="text-slate-400 text-xs">See your money patterns</Text></View>
            
            {/* Heatmap */}
            <HeatmapGrid data={heatmapData} />

            <View className="bg-[#2E1065] p-5 rounded-3xl mb-8 border border-purple-500/30">
              <View className="flex-row items-center mb-4"><MaterialCommunityIcons name="star-four-points" size={16} color="#Facc15" style={{marginRight:6}} /><Text className="text-white font-bold">Your Best Earning Shifts</Text></View>
              
              {/* Best Shifts */}
              {shiftData.map(shift => (
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