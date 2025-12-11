import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, RefreshControl, Image ,Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/apiConfig';
import moment from 'moment'; 

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

//  Heatmap Grid 
const HeatmapGrid = ({ data, currentDate, onMonthChange, loading }) => {
  
  // Create a map for easy lookup: '2023-11-01' -> dataObject
  const dataMap = {};
  if (data) {
    data.forEach(item => {
      dataMap[item.date] = item;
    });
  }

  const getColor = (dayNum) => {
    // Construct date string for lookup
    const dateStr = currentDate.clone().date(dayNum).format('YYYY-MM-DD');
    const entry = dataMap[dateStr];
    
    if (!entry) return 'bg-slate-800'; // Default Empty
    
    // Use Backend Status
    switch (entry.status) {
      case 'high_earning': return 'bg-emerald-500';
      case 'heavy_expense': return 'bg-red-500';
      case 'balanced': return 'bg-amber-400';
      default: return 'bg-slate-800';
    }
  };

  // Helper to determine text color based on bg
  const getTextColor = (dayNum) => {
    const bgClass = getColor(dayNum);
    return bgClass === 'bg-slate-800' ? 'text-slate-600' : 'text-[#0F172A]';
  };

  // Calculate days in the currently selected month
  const daysInMonth = currentDate.daysInMonth();
  const startDayOffset = currentDate.clone().startOf('month').day(); // 0 (Sun) to 6 (Sat)

  return (
    <View className="bg-[#1E293B] p-4 rounded-3xl mb-6 shadow-lg shadow-black/50">
      
      {/* Month Navigator */}
      <View className="flex-row justify-between items-center mb-4 bg-slate-800/50 p-2 rounded-xl">
        <TouchableOpacity onPress={() => onMonthChange(-1)} className="p-2">
          <Ionicons name="caret-back" size={20} color="#60A5FA" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-base">{currentDate.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={() => onMonthChange(1)} className="p-2">
          <Ionicons name="caret-forward" size={20} color="#60A5FA" />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View className="flex-row justify-center space-x-3 mb-4">
        <View className="flex-row items-center"><View className="w-3 h-3 bg-emerald-500 rounded mr-2"/><Text className="text-slate-400 text-[10px]">Profit</Text></View>
        <View className="flex-row items-center"><View className="w-3 h-3 bg-amber-400 rounded mr-2"/><Text className="text-slate-400 text-[10px]">Balanced</Text></View>
        <View className="flex-row items-center"><View className="w-3 h-3 bg-red-500 rounded mr-2"/><Text className="text-slate-400 text-[10px]">Loss</Text></View>
      </View>

      {/* Grid */}
      {loading ? (
        <View className="h-40 justify-center items-center">
          <ActivityIndicator size="small" color="#10B981" />
        </View>
      ) : (
        <View className="flex-row flex-wrap">
           {/* Header Days */}
           {['S','M','T','W','T','F','S'].map((d, i) => (
             <Text key={i} className="text-slate-500 w-[13.5%] text-center mb-2 font-bold text-xs">{d}</Text>
           ))}
           
           {/* Empty slots for offset */}
           {Array.from({ length: startDayOffset }).map((_, i) => (
             <View key={`empty-${i}`} className="w-[13.5%] aspect-square m-[0.3%]" />
           ))}

           {/* Days */}
           {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
             <View key={day} className={`w-[13.5%] aspect-square m-[0.3%] ${getColor(day)} rounded-md items-center justify-center`}>
               <Text className={`font-bold text-xs ${getTextColor(day)}`}>{day}</Text>
             </View>
           ))}
        </View>
      )}
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
const ChallengeCard = ({ item, onComplete }) => {
  const isCompleted = item.type === 'completed';
  const isPending = item.type === 'pending';
  
  return (
    <View className={`p-4 rounded-2xl mb-3 border ${
      isCompleted 
        ? 'bg-[#064e3b] border-emerald-500/50' 
        : 'bg-[#1E293B] border-slate-700/50'
    }`}>
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center flex-1 pr-2">
           <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
             isCompleted ? 'bg-emerald-500' : 'bg-slate-700'
           }`}>
             <Ionicons 
               name={isCompleted ? 'checkmark-circle' : item.icon} 
               size={20} 
               color={isCompleted ? "white" : item.color} 
             />
           </View>
           <View className="flex-1">
             <Text className="text-white font-bold text-base">{item.title}</Text>
             <Text className="text-slate-400 text-xs">{item.subtitle}</Text>
           </View>
        </View>
        <View className={`px-2 py-1 rounded-lg ${isCompleted ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
          <Text className={`font-bold text-xs ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
            +₹{item.amount}
          </Text>
        </View>
      </View>

      {/* Action Button or Completion Status */}
      {isCompleted ? (
         <View className="mt-2 bg-emerald-900/30 py-2 rounded-lg items-center border border-emerald-500/30">
           <Text className="text-emerald-400 font-bold text-xs">✓ Completed</Text>
         </View>
      ) : (
        <TouchableOpacity
          className="mt-2 bg-slate-700/50 py-2 rounded-lg items-center border border-slate-600 active:bg-slate-600"
          onPress={() => onComplete(item.challengeId)}
          disabled={isCompleted}
        >
          <Text className="text-amber-500 font-bold text-xs">{item.btnText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- UPDATED JAR ITEM  ---
const JarItem = ({ item, onAddPress, onOptionsPress }) => {
  if (item.isAdd) {
    return (
      <TouchableOpacity onPress={onAddPress} className="w-[48%] bg-[#1E293B] aspect-[0.85] rounded-2xl border-2 border-dashed border-slate-700 items-center justify-center mb-4">
        <View className="w-12 h-12 rounded-full bg-slate-700 items-center justify-center mb-2">
          <Ionicons name="add" size={24} color="#94A3B8" />
        </View>
        <Text className="text-slate-500 font-medium">New Jar</Text>
      </TouchableOpacity>
    );
  }

  const progress = (item.saved / item.target) * 100;

  return (
    <View className={`w-[48%] ${item.bg || 'bg-slate-800'} p-4 rounded-2xl mb-4`}>
      <View className="items-center mb-2">
        <MaterialCommunityIcons name={item.icon || 'piggy-bank'} size={32} color={item.color || '#fff'} style={{marginBottom: 8}} />
        <Text className="text-white font-bold text-base text-center" numberOfLines={1}>{item.title}</Text>
        <Text className="text-white font-bold text-xl my-1">₹{item.saved}</Text>
      </View>

      <View className="mb-3">
        <View className="h-2 bg-black/20 rounded-full overflow-hidden mb-1">
          <View style={{ width: `${progress}%`, backgroundColor: item.color || '#fff' }} className="h-full rounded-full" />
        </View>
        <Text className="text-slate-300 text-[10px] text-center">{Math.round(progress)}% of ₹{item.target}</Text>
      </View>

      <TouchableOpacity 
        className="absolute top-2 right-2 p-2 z-10" 
        onPress={() => onOptionsPress(item)}
      >
        <Ionicons name="ellipsis-vertical" size={16} color="white" />
      </TouchableOpacity>

      
      <TouchableOpacity 
        className="bg-black/20 py-2.5 rounded-xl flex-row items-center justify-center border border-white/10"
        onPress={() => onAddPress(item)} 
      >
        <Ionicons name="add" size={16} color="white" style={{marginRight: 2}} />
        <Text className="text-white text-xs font-bold">Add ₹{item.suggested_amt || 100}</Text>
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJar, setSelectedJar] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({ total: 0, count: 0 });
  const [unallocatedCash, setUnallocatedCash] = useState(0);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  // --- HEATMAP STATE (New) ---
  const [heatmapData, setHeatmapData] = useState([]);
  const [currentHeatmapDate, setCurrentHeatmapDate] = useState(moment());
  const [heatmapLoading, setHeatmapLoading] = useState(false);


  //saving jars
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newJarTitle, setNewJarTitle] = useState('');
  const [newJarTarget, setNewJarTarget] = useState('');
  const [newJarDuration, setNewJarDuration] = useState(3); 
  const [newJarIcon, setNewJarIcon] = useState('piggy-bank');
  const [newJarColor, setNewJarColor] = useState('#10B981'); 
  const [isCreating, setIsCreating] = useState(false);


  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [jarToEdit, setJarToEdit] = useState(null); 
  const [isEditMode, setIsEditMode] = useState(false);

  const ICONS = ['piggy-bank', 'car', 'home', 'gift', 'airplane', 'school', 'medical-bag', 'laptop'];
 
  const THEMES = [
    { hex: '#10B981', bg: 'bg-[#064E3B]' }, // Emerald -> Dark Green
    { hex: '#3B82F6', bg: 'bg-[#1E3A8A]' }, // Blue -> Dark Blue
    { hex: '#F59E0B', bg: 'bg-[#78350F]' }, // Amber -> Dark Orange/Brown
    { hex: '#EF4444', bg: 'bg-[#450A0A]' }, // Red -> Dark Red
    { hex: '#8B5CF6', bg: 'bg-[#4A044E]' }, // Violet -> Dark Purple
    { hex: '#EC4899', bg: 'bg-[#4C0519]' }, // Pink -> Dark Rose
  ];
  const DURATIONS = [
    { label: '1 M', value: 1 },
    { label: '3 M', value: 3 },
    { label: '6 M', value: 6 },
    { label: '1 Y', value: 12 },
  ];


  const openDepositModal = (jar) => {
    setSelectedJar(jar);
    setDepositAmount(jar.suggested_amt ? jar.suggested_amt.toString() : '');
    setModalVisible(true);
  };

  //  HANDLE DEPOSIT 
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsDepositing(true);
    try {
      const response = await fetch(getApiUrl(`/jars/${selectedJar._id || selectedJar.id}/deposit`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          amount: Number(depositAmount)
        })
      });

      const data = await response.json();

      if (data.success) {
        setModalVisible(false);
        setDepositAmount('');
        Alert.alert("Success", `₹${depositAmount} added to ${selectedJar.title}!`);
        handleRefresh();
        fetchJarsData(userId);
        
        if (data.newUnallocated !== undefined) {
           setUnallocatedCash(data.newUnallocated);
        } else {
           fetchUserStats(userId);
        }

      } else {
        Alert.alert("Failed", data.message || "Could not deposit money.");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsDepositing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  //CREATE NEW JAR
  const handleCreateJar = async () => {
    // 1. Validation
    if (!newJarTitle.trim() || !newJarTarget || isNaN(newJarTarget)) {
      Alert.alert("Missing Info", "Please enter a title and a valid target amount.");
      return;
    }

    setIsCreating(true);
    try {
      const deadlineDate = moment().add(newJarDuration, 'months').toDate();
      const selectedTheme = THEMES.find(t => t.hex === newJarColor);
      const bgClass = selectedTheme ? selectedTheme.bg : 'bg-slate-800'; 

      const payload = {
        userId: userId,
        title: newJarTitle,
        target: Number(newJarTarget),
        deadline: deadlineDate,
        icon: newJarIcon,
        color: newJarColor,
        bg: bgClass 
      };

    
      let url = '/jars';
      let method = 'POST';

      if (isEditMode && jarToEdit) {
        url = `/jars/${jarToEdit._id || jarToEdit.id}`;
        method = 'PUT';
      }

    
      const response = await fetch(getApiUrl(url), {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setCreateModalVisible(false);
        
        //
        setIsEditMode(false);
        setJarToEdit(null);
        setNewJarTitle('');
        setNewJarTarget('');
        setNewJarIcon('piggy-bank');
        setNewJarColor('#10B981'); 
        
        Alert.alert("Success", isEditMode ? "Jar updated successfully!" : "New Savings Jar created!");
        fetchJarsData(userId); // Refresh list
      } else {
        Alert.alert("Error", data.message || "Could not save jar.");
      }
    } catch (error) {
      console.error("Save Jar Error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };


  
  const openJarOptions = (jar) => {
    setJarToEdit(jar);
    setOptionsModalVisible(true);
  };

 
  const handleDeleteJar = async () => {
    if (!jarToEdit) return;

    Alert.alert(
      "Delete Jar?",
      `Are you sure you want to delete "${jarToEdit.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const response = await fetch(getApiUrl(`/jars/${jarToEdit._id || jarToEdit.id}`), {
                method: 'DELETE',
              });
              const data = await response.json();
              
              if (data.success) {
                setOptionsModalVisible(false);
                fetchJarsData(userId); // Refresh list
              } else {
                Alert.alert("Error", data.message);
              }
            } catch (error) {
              Alert.alert("Error", "Could not delete jar");
            }
          }
        }
      ]
    );
  };

  
  const handleEditPress = () => {
    setOptionsModalVisible(false); 
    
    
    setNewJarTitle(jarToEdit.title);
    setNewJarTarget(jarToEdit.target.toString());
    setNewJarIcon(jarToEdit.icon);
    setNewJarColor(jarToEdit.color);
    
    
    setIsEditMode(true); 
    setCreateModalVisible(true); 
  };



  
  useEffect(() => {
    if (viewMode === 'Insights' && userId) {
      fetchHeatmapData(userId, currentHeatmapDate);
    }
  }, [viewMode, currentHeatmapDate, userId]);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const userIdValue = userData.userId || userData._id;
        setUserId(userIdValue);
        fetchBudgetData(userIdValue);
        fetchJarsData(userIdValue);
        fetchMonthlyStats(userIdValue);
        fetchUserStats(userIdValue);
        fetchDailyChallenges(userIdValue);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  };

  const fetchUserStats = async (userIdValue) => {
    try {
      const response = await fetch(getApiUrl(`/users/${userIdValue}`));
      const data = await response.json();
      if (data.success && data.user.stats) {
        setUnallocatedCash(data.user.stats.unallocatedCash || 0);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchMonthlyStats = async (userIdValue) => {
    try {
      const response = await fetch(getApiUrl(`/jars/${userIdValue}/stats`));
      const data = await response.json();
      
      if (data.success) {
        setMonthlyStats({
          total: data.data.totalSavedThisMonth,
          count: data.data.challengesCompleted
        });
      }
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
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
      const response = await fetch(getApiUrl(`/jars/${userIdValue}`));
      const data = await response.json();

      if (data.success && data.data) {
        const jarsWithAddButton = [
          ...data.data, 
          { id: 'add-new', isAdd: true }
        ];
        setJarsData(jarsWithAddButton);
      }
    } catch (error) {
      console.error("Error fetching jars:", error);
    }
  };

  const fetchDailyChallenges = async (userIdValue) => {
    if (!userIdValue) return;
    setLoadingChallenges(true);
    try {
      const response = await fetch(getApiUrl(`/daily-challenges/${userIdValue}`));
      const data = await response.json();

      if (data.success) {
        const mapped = data.challenges.map(ch => ({
          id: ch._id || ch.challengeId,
          challengeId: ch.challengeId,
          title: ch.title,
          subtitle: ch.description,
          amount: ch.rewardPaise ? Math.floor(ch.rewardPaise / 100) : (ch.amount || 0),
          type: ch.status === 'completed' ? 'completed' : (ch.status === 'active' ? 'pending' : ch.status),
          icon: ch.icon || 'checkmark-circle',
          color: ch.color || '#10B981',
          btnText: ch.status === 'completed' ? 'Completed' : 'Mark as Done',
        }));
        setDailyChallenges(mapped);
      } else {
        setDailyChallenges([]);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
      setDailyChallenges([]);
    } finally {
      setLoadingChallenges(false);
    }
  };
  const completeChallenge = async (challengeId, jarId = null) => {
    if (!challengeId || !userId) return;
    
    try {
      // Optimistically update UI
      setDailyChallenges(prev => prev.map(ch => 
        ch.challengeId === challengeId ? { ...ch, type: 'completed', btnText: 'Completed' } : ch
      ));

      const requestBody = { userId };
      if (jarId) {
        requestBody.jarId = jarId;
      }

      const response = await fetch(getApiUrl(`/daily-challenges/${challengeId}/complete`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        // Show success message with reward details
        const rewardAmount = data.challenge?.rewardAmount || (data.challenge?.rewardPaise / 100) || 0;
        const jarMessage = data.jar ? `\nAdded to ${data.jar.title}` : '';
        
        Alert.alert(
          "🎉 Challenge Complete!",
          `${data.message || `Great job! You earned ₹${rewardAmount}`}${jarMessage}`,
          [{ text: "Awesome!", onPress: () => {} }]
        );

        // Update dashboard stats immediately from backend response
        if (data.dashboard) {
          setUnallocatedCash(data.dashboard.unallocatedCash || 0);
          setMonthlyStats({
            total: data.dashboard.monthlySavings || 0,
            count: data.dashboard.monthlyTransactions || 0
          });
        }

        // Refresh all related data
        await Promise.all([
          fetchDailyChallenges(userId),
          fetchJarsData(userId),
          fetchUserStats(userId),
          fetchMonthlyStats(userId)
        ]);
      } else {
        // Revert optimistic update on error
        setDailyChallenges(prev => prev.map(ch => 
          ch.challengeId === challengeId ? { ...ch, type: 'pending', btnText: 'Mark as Done' } : ch
        ));
        Alert.alert("Error", data.message || "Could not complete the challenge");
      }
    } catch (err) {
      console.error("Complete challenge error:", err);
      // Revert optimistic update on error
      setDailyChallenges(prev => prev.map(ch => 
        ch.challengeId === challengeId ? { ...ch, type: 'pending', btnText: 'Mark as Done' } : ch
      ));
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  // --- FETCH HEATMAP DATA  ---
  const fetchHeatmapData = async (uid, dateMoment) => {
    try {
      setHeatmapLoading(true);
      const month = dateMoment.month() + 1; // 1-12
      const year = dateMoment.year();

      const response = await fetch(getApiUrl(`/heatmap?userId=${uid}&month=${month}&year=${year}`));
      const result = await response.json();

      if (result.data) {
        setHeatmapData(result.data);
      }
    } catch (error) {
      console.error("Heatmap Fetch Error:", error);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const handleHeatmapMonthChange = (direction) => {
    setCurrentHeatmapDate(moment(currentHeatmapDate).add(direction, 'months'));
  };


  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    const promises = [
      fetchBudgetData(userId),
      fetchJarsData(userId),
      fetchMonthlyStats(userId),
      fetchDailyChallenges(userId), 
    ];
    
    
    if (viewMode === 'Insights') {
      promises.push(fetchHeatmapData(userId, currentHeatmapDate));
    }

    await Promise.all(promises);
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

            {/* Savings Goals - Real Data */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-bold text-xl">Savings Goals</Text>
              {/* Optional: Add a small 'See All' or 'Add' button if list is empty */}
            </View>

            {/* Filter out the 'add-new' button we added for the other screen */}
            {jarsData.filter(jar => !jar.isAdd).length > 0 ? (
              jarsData
                .filter(jar => !jar.isAdd) 
                .map((jar) => (
                  <GoalCard key={jar._id || jar.id} item={jar} />
                ))
            ) : (
              <View className="bg-[#1E293B] p-6 rounded-2xl items-center mb-4 border border-dashed border-slate-700">
                <Text className="text-slate-400 mb-2">No active savings goals</Text>
                <TouchableOpacity onPress={() => setViewMode('Challenges')}>
                   <Text className="text-emerald-500 font-bold">Create your first Jar →</Text>
                </TouchableOpacity>
              </View>
            )}
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
             <View className="bg-[#10B981] rounded-3xl p-6 mb-6 shadow-lg shadow-emerald-500/20">
                <Text className="text-emerald-900 font-medium mb-1">Total Saved This Month</Text>
                <Text className="text-white font-bold text-4xl mb-4">₹{Math.floor(monthlyStats.total).toLocaleString('en-IN')}</Text>
                <View className="flex-row gap-3">
                   <View className="bg-emerald-800/20 px-3 py-1.5 rounded-lg flex-row items-center border border-emerald-400/30">
                      <Ionicons name="trophy" size={14} color="#FFD700" style={{marginRight: 6}} />
                      <Text className="text-white text-xs font-bold">{monthlyStats.count} challenges done</Text>
                   </View>
                   <View className="bg-emerald-800/20 px-3 py-1.5 rounded-lg flex-row items-center border border-emerald-400/30">
                      <Ionicons name="wallet" size={14} color="#FB923C" style={{marginRight: 6}} />
                      <Text className="text-white text-xs font-bold">₹{Math.floor(unallocatedCash)} available</Text>
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
                  <Text className="text-slate-400 text-xs">
                    {dailyChallenges.filter(ch => ch.type === 'completed').length}/{dailyChallenges.length} done
                  </Text>
                </View>
             </View>

             <View className="mb-8">
               {loadingChallenges ? (
                  <ActivityIndicator color="#10B981" size="small" className="my-4" />
                ) : dailyChallenges.length === 0 ? (
                  <View className="bg-[#1E293B] p-6 rounded-2xl items-center border border-dashed border-slate-700">
                    <Ionicons name="calendar-outline" size={40} color="#64748B" style={{marginBottom: 8}} />
                    <Text className="text-slate-400 text-center">No challenges for today</Text>
                    <Text className="text-slate-500 text-xs text-center mt-2">Check back tomorrow for new tasks!</Text>
                  </View>
                ) : (
                  dailyChallenges.map(item => (
                    <ChallengeCard 
                      key={item.id || item.challengeId} 
                      item={item} 
                      onComplete={completeChallenge}
                    />
                  ))
                )}
             </View>

             {/* Savings Jars Grid */}
             <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons name="gift-outline" size={20} color="#F472B6" />
                <Text className="text-white font-bold text-lg ml-2">Savings Jars</Text>
             </View>

             {/* <View className="flex-row flex-wrap justify-between mb-6">
                {jarsData.map(jar => <JarItem key={jar.id} item={jar} onAddPress={openDepositModal}/>)}
             </View> */}

             {/* <View className="flex-row flex-wrap justify-between mb-6">
              {jarsData.map(jar => (
               <JarItem 
                key={jar.id || jar._id} 
                item={jar} 
               onAddPress={jar.isAdd ? () => setCreateModalVisible(true) : openDepositModal}
                />
               ))}
              </View> */}

              <View className="flex-row flex-wrap justify-between mb-6">
  {jarsData.map(jar => (
    <JarItem 
      key={jar.id || jar._id} 
      item={jar} 
      
      
      onAddPress={jar.isAdd ? () => {
          setIsEditMode(false);       // Ensure we are in create mode, not edit
          setNewJarTitle('');         // Clear title
          setNewJarTarget('');        // Clear amount
          setNewJarColor('#10B981');  // Reset color
          setCreateModalVisible(true); 
      } : openDepositModal}

     
      onOptionsPress={openJarOptions} 
    />
  ))}
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
            
            {/* Heatmap - REAL DATA */}
            <HeatmapGrid 
              data={heatmapData} 
              currentDate={currentHeatmapDate}
              onMonthChange={handleHeatmapMonthChange}
              loading={heatmapLoading}
            />

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

      {/* --- DEPOSIT MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          {/* DIMMED BACKGROUND */}
          <TouchableOpacity 
            className="absolute top-0 bottom-0 left-0 right-0 bg-black/70" 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          />

          {/* MODAL CONTENT */}
          <View className="bg-[#1E293B] rounded-t-3xl p-6 border-t border-slate-700">
            <View className="items-center mb-6">
              <View className="w-12 h-1 bg-slate-600 rounded-full mb-4" />
              <Text className="text-white text-xl font-bold">Add to {selectedJar?.title}</Text>
              <Text className="text-slate-400 text-sm">Safe to spend check will apply</Text>
            </View>

            {/* AMOUNT INPUT */}
            <View className="bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-700 flex-row items-center">
              <Text className="text-emerald-500 text-2xl font-bold mr-2">₹</Text>
              <TextInput 
                className="flex-1 text-white text-3xl font-bold"
                placeholder="0"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
                autoFocus={true}
              />
            </View>

            <View className="flex-row justify-between items-center mb-6 px-1">
              <Text className="text-slate-400 text-xs">Available to save:</Text>
              <Text className={`font-bold text-xs ${Number(depositAmount) > unallocatedCash ? 'text-red-400' : 'text-emerald-400'}`}>
                ₹{unallocatedCash.toLocaleString('en-IN')}
              </Text>
            </View>

            {/* ACTION BUTTONS */}
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity 
                className="flex-1 bg-slate-700 py-4 rounded-xl items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-emerald-500 py-4 rounded-xl items-center"
                onPress={handleDeposit}
                disabled={isDepositing}
              >
                {isDepositing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Confirm Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
        
        {/* --- CREATE NEW JAR MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          {/* Dimmed Background */}
          <TouchableOpacity 
            className="absolute top-0 bottom-0 left-0 right-0 bg-black/80" 
            activeOpacity={1} 
            onPress={() => setCreateModalVisible(false)}
          />

          <View className="bg-[#1E293B] rounded-t-3xl p-6 border-t border-slate-700 h-[85%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <View className="items-center mb-6">
                <View className="w-12 h-1 bg-slate-600 rounded-full mb-4" />
                <Text className="text-white text-xl font-bold">Create New Jar</Text>
              </View>

              {/*  NAME */}
              <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Goal Name</Text>
              <TextInput 
                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 mb-6 font-bold text-lg"
                placeholder="e.g. New Bike, Diwali"
                placeholderTextColor="#64748B"
                value={newJarTitle}
                onChangeText={setNewJarTitle}
              />

              {/*  TARGET AMOUNT */}
              <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Target Amount (₹)</Text>
              <TextInput 
                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 mb-6 font-bold text-lg"
                placeholder="10000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={newJarTarget}
                onChangeText={setNewJarTarget}
              />

              {/*  DURATION  */}
              <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Time to achieve</Text>
              <View className="flex-row justify-between mb-6">
                {DURATIONS.map((dur) => (
                  <TouchableOpacity 
                    key={dur.value}
                    onPress={() => setNewJarDuration(dur.value)}
                    className={`flex-1 mx-1 py-3 rounded-xl items-center border ${newJarDuration === dur.value ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <Text className={`font-bold ${newJarDuration === dur.value ? 'text-white' : 'text-slate-400'}`}>{dur.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/*  CHOOSE ICON */}
              <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Choose Icon</Text>
              <View className="flex-row flex-wrap mb-6 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                {ICONS.map((icon) => (
                  <TouchableOpacity 
                    key={icon}
                    onPress={() => setNewJarIcon(icon)}
                    className={`p-3 m-1 rounded-full ${newJarIcon === icon ? 'bg-white' : 'bg-slate-800'}`}
                  >
                    <MaterialCommunityIcons name={icon} size={24} color={newJarIcon === icon ? '#1E293B' : '#64748B'} />
                  </TouchableOpacity>
                ))}
              </View>

              
              {/* COLOR */}
            <Text className="text-slate-400 text-xs font-bold uppercase mb-2">Color Theme</Text>
            <View className="flex-row justify-between mb-8 bg-slate-900 p-3 rounded-2xl border border-slate-800">
             {THEMES.map((theme) => (
               <TouchableOpacity 
               key={theme.hex}
               onPress={() => setNewJarColor(theme.hex)}
               style={{ backgroundColor: theme.hex }}
               className={`w-10 h-10 rounded-full items-center justify-center ${newJarColor === theme.hex ? 'border-4 border-white' : ''}`}
                >
               {newJarColor === theme.hex && <Ionicons name="checkmark" size={20} color="white" />}
               </TouchableOpacity>
               ))}
             </View>

              {/* SPACER FOR SCROLL */}
              <View className="h-20" />
            </ScrollView>

            {/* FIXED BOTTOM BUTTON */}
            <View className="absolute bottom-6 left-6 right-6">
              <TouchableOpacity 
                className="bg-emerald-500 py-4 rounded-2xl items-center shadow-lg shadow-emerald-500/20"
                onPress={handleCreateJar}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Create Goal Jar</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- OPTIONS MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/60 justify-center items-center p-6"
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View className="bg-[#1E293B] w-full max-w-sm rounded-2xl p-4 border border-slate-700">
            <Text className="text-white font-bold text-center text-lg mb-6">
              Manage "{jarToEdit?.title}"
            </Text>

            {/* Edit Button */}
            <TouchableOpacity 
              className="bg-slate-700 p-4 rounded-xl flex-row items-center mb-3"
              onPress={handleEditPress}
            >
              <Ionicons name="pencil" size={20} color="#3B82F6" style={{marginRight: 12}} />
              <Text className="text-white font-bold text-base">Edit Details</Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity 
              className="bg-red-500/10 p-4 rounded-xl flex-row items-center"
              onPress={handleDeleteJar}
            >
              <Ionicons name="trash" size={20} color="#EF4444" style={{marginRight: 12}} />
              <Text className="text-red-400 font-bold text-base">Delete Jar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}