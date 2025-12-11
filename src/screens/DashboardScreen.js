import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../utils/apiConfig'; 


const ActionButton = ({ icon, color, label, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-[#1E293B] w-[45%] aspect-square rounded-2xl items-center justify-center space-y-2"
  >
    <View className="p-2 rounded-full bg-slate-800 border border-slate-700">
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text className="text-gray-400 text-xs font-medium">{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const navigation = useNavigation(); 
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      } else {
        console.log('No user data found, redirecting to login');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const storedUserData = await AsyncStorage.getItem("userData");
      
      if (!token || !storedUserData) {
        throw new Error("No token or user data found");
      }

      const userData = JSON.parse(storedUserData);
      const userId = userData.userId || userData._id;
      
      if (!userId) {
        throw new Error("No user ID found");
      }

      const response = await fetch(getApiUrl(`/users/${userId}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      
      // Check if response is HTML (error page)
      if (responseText.startsWith('<')) {
        throw new Error('Server returned HTML instead of JSON. Check if backend is running.');
      }
      
      const data = JSON.parse(responseText);

      if (response.ok && data.success) {
        setUserData(data.user);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
      } else {
        throw new Error(data.error || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert("Error", `Failed to refresh user data: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["userToken", "userData"]);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              });
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F172A] justify-center items-center">
        <Text className="text-white text-lg">Loading...</Text>
      </SafeAreaView>
    );
  } 


  // ---------------------------------------------------------
  // 1. EXTRACT DATA & CALCULATE UNALLOCATED CASH
  // ---------------------------------------------------------
  const stats = userData?.stats || {};
  

  const todayEarned = stats.todayEarned || 0;
  const todaySpent = stats.todaySpent || 0;
  const todayBalance = todayEarned - todaySpent;

  const totalIncome = stats.totalEarnings || 0;
  const totalExpenses = stats.totalSpent || 0;
  const totalSaved = stats.totalSaved || 0; 

  const unallocatedCash = stats.unallocatedCash !== undefined 
    ? stats.unallocatedCash 
    : (totalIncome - totalExpenses - totalSaved);
  // ---------------------------------------------------------




  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        className="flex-1 px-5 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        
         {/* HEADER SECTION  */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-400 text-sm font-medium">
              Good Evening, {userData?.name || 'User'} 
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">Dashboard</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="relative bg-slate-800 p-2 rounded-full mr-2"
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="white" />
              {/* <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-slate-900" /> */}
            </TouchableOpacity>
            {/* <TouchableOpacity 
              className="bg-red-600 px-3 py-2 rounded-full" 
              onPress={handleLogout}
            >
              <Text className="text-white text-xs font-bold">Logout</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* BALANCE & UNALLOCATED CARD */}
        <View className="bg-[#10B981] rounded-3xl p-6 mb-6 shadow-lg" style={{ overflow: 'hidden' }}>
          
          {/* TOP ROW: Split View - Two columns */}
          <View className="flex-row justify-between items-start mb-8">
            
            {/* LEFT: Today's Balance */}
            <View className="flex-1 pr-4">
              <Text className="text-emerald-50 text-xs font-semibold uppercase tracking-widest opacity-90">
                Today's Balance
              </Text>
              <Text className="text-white text-2xl font-black mt-2 mb-1">
                ₹{todayBalance.toLocaleString('en-IN')}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className={`w-2 h-2 rounded-full mr-2 ${todayBalance >= 0 ? 'bg-emerald-100' : 'bg-red-200'}`} />
                <Text className={`text-emerald-50 text-xs font-medium opacity-80 ${todayBalance >= 0 ? '' : 'text-red-100'}`}>
                  {todayBalance >= 0 ? 'Profit today' : 'Overspent today'}
                </Text>
              </View>
            </View>

            {/* RIGHT: Unallocated Cash */}
            <View className="flex-1 pl-4 border-l border-emerald-400/40"> 
               <Text className="text-emerald-50 text-xs font-semibold uppercase tracking-widest opacity-90">
                 Safe to Save
               </Text>
               <Text className="text-white text-2xl font-black mt-2">
                 ₹{unallocatedCash.toLocaleString('en-IN')}
               </Text>
               <View className="flex-row items-center mt-2">
                 <FontAwesome5 name="wallet" size={11} color="#f0fdf4" style={{marginRight: 6, opacity: 0.8}}/>
                 <Text className="text-emerald-50 text-xs font-medium opacity-80">Available to use</Text>
               </View>
            </View>
          </View>
          
          {/* BOTTOM ROW: Today's Breakdown */}
          <View className="flex-row justify-between pt-6 border-t border-emerald-400/40 gap-3">
            {/* Earned */}
            <View className="flex-1 items-center">
              <View className="bg-white/20 p-2.5 rounded-full mb-2">
                <Ionicons name="arrow-down" size={14} color="#fff" />
              </View>
              <Text className="text-emerald-50 text-[11px] font-semibold uppercase opacity-80">Earned</Text>
              <Text className="text-white font-black text-base mt-1">₹{todayEarned.toLocaleString('en-IN')}</Text>
            </View>

            {/* Spent */}
            <View className="flex-1 items-center">
              <View className="bg-red-600/40 p-2.5 rounded-full mb-2">
                <Ionicons name="arrow-up" size={14} color="#fff" />
              </View>
              <Text className="text-emerald-50 text-[11px] font-semibold uppercase opacity-80">Spent</Text>
              <Text className="text-white font-black text-base mt-1">₹{todaySpent.toLocaleString('en-IN')}</Text>
            </View>

            {/* Saved */}
            <View className="flex-1 items-center">
               <View className="bg-yellow-400/40 p-2.5 rounded-full mb-2">
                <FontAwesome5 name="piggy-bank" size={12} color="#fff" />
              </View>
              <Text className="text-emerald-50 text-[11px] font-semibold uppercase opacity-80">Saved</Text>
              <Text className="text-white font-black text-base mt-1">₹{stats.todaySaved || 0}</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS ROW */}
        <View className="flex-row w-full justify-evenly mb-6 px-4">
          
          <ActionButton className=""
            icon="arrow-down-outline" 
            color="#10B981" 
            label="Received" 
            onPress={() => navigation.navigate('SMSParser')} 
          />
          <ActionButton 
            icon="arrow-up-outline" 
            color="#F43F5E" 
            label="Paid" 
            onPress={() => navigation.navigate('SMSParser')} 
          />
          
        </View>

        {/*  SPENDING ALERT */}
        <View className="bg-[#2a1515] border border-red-900/50 rounded-2xl p-4 mb-6 flex-row">
          <View className="bg-orange-500/20 p-3 rounded-full h-12 w-12 items-center justify-center mr-4">
             <Ionicons name="warning" size={24} color="#F97316" />
          </View>
          <View className="flex-1">
            <Text className="text-orange-500 font-bold text-lg mb-1">Spending Alert!</Text>
            <Text className="text-gray-400 text-xs leading-5">
              Your fuel spending is 32% higher this week. Reduce 1 trip to save ₹120.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text className="text-orange-500 font-bold text-sm mt-2">View Details →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*  GAMIFICATION CHALLENGE  */}
        <View className="bg-[#1E293B] rounded-2xl p-5 mb-6">
          <View className="flex-row justify-between items-center mb-3">
             <View className="flex-row items-center">
                <MaterialCommunityIcons name="fire" size={24} color="#F97316" />
                <Text className="text-white font-bold text-lg ml-2">Today's Challenge</Text>
             </View>
             <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                <Text className="text-emerald-400 text-xs font-bold">+₹25 reward</Text>
             </View>
          </View>
          
          <Text className="text-gray-400 text-sm mb-4">
            Use bus instead of auto for one trip today
          </Text>

          {/* Progress Bar Hack */}
          <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <View className="h-full w-[60%] bg-emerald-500 rounded-full" />
          </View>
          <Text className="text-gray-500 text-xs mt-2">3 of 5 completed this week</Text>
        </View>

        {/* LIST SECTION */}
        {/* <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-bold text-lg">Auto-Captured (SMS)</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SMSParser')}>
             <Text className="text-emerald-500 text-sm">View All</Text>
          </TouchableOpacity>
        </View> */}

        {/* List Item */}
        {/* <View className="bg-[#1E293B] p-4 rounded-xl flex-row items-center mb-20">
          <View className="bg-slate-700 h-10 w-10 rounded-full items-center justify-center mr-3">
             <MaterialCommunityIcons name="motorbike" size={20} color="#F472B6" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base">Swiggy Payout</Text>
            <Text className="text-gray-500 text-xs">Via SMS • 2:34 PM</Text>
          </View>
          <Text className="text-emerald-400 font-bold text-base">+₹847</Text>
        </View> */}

      </ScrollView>
    </SafeAreaView>
  );
}