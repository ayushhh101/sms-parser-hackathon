import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 


const ActionButton = ({ icon, color, label, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="bg-[#1E293B] w-[30%] aspect-square rounded-2xl items-center justify-center space-y-2"
  >
    <View className="p-2 rounded-full bg-slate-800 border border-slate-700">
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text className="text-gray-400 text-xs font-medium">{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const navigation = useNavigation(); 

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      <ScrollView className="flex-1 px-5 pt-4">
        
         {/* HEADER SECTION  */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-400 text-sm font-medium">Good Evening, Raju 👋</Text>
            <Text className="text-white text-2xl font-bold mt-1">Your Money Dashboard</Text>
          </View>
          <TouchableOpacity className="relative bg-slate-800 p-2 rounded-full">
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-slate-900" />
          </TouchableOpacity>
        </View>

        {/*  BALANCE CARD */}
        <View className="bg-[#10B981] rounded-3xl p-6 mb-6 shadow-lg">
          <Text className="text-emerald-100 text-base font-medium">Today's Balance</Text>
          <Text className="text-white text-4xl font-bold mt-2">₹4,850</Text>
          
          <View className="flex-row justify-between mt-6">
            {/* Earned */}
            <View className="flex-row items-center bg-white/20 px-3 py-2 rounded-xl">
              <View className="bg-emerald-100 rounded-full p-1 mr-2">
                <Ionicons name="arrow-down" size={12} color="#059669" />
              </View>
              <View>
                <Text className="text-emerald-50 text-[10px]">Earned</Text>
                <Text className="text-white font-bold">₹2,340</Text>
              </View>
            </View>

            {/* Spent */}
            <View className="flex-row items-center bg-white/20 px-3 py-2 rounded-xl">
              <View className="bg-red-100 rounded-full p-1 mr-2">
                <Ionicons name="arrow-up" size={12} color="#DC2626" />
              </View>
              <View>
                <Text className="text-emerald-50 text-[10px]">Spent</Text>
                <Text className="text-white font-bold">₹890</Text>
              </View>
            </View>

            {/* Saved */}
            <View className="flex-row items-center bg-white/20 px-3 py-2 rounded-xl">
               <View className="bg-yellow-100 rounded-full p-1 mr-2">
                <FontAwesome5 name="piggy-bank" size={10} color="#D97706" />
              </View>
              <View>
                <Text className="text-emerald-50 text-[10px]">Saved</Text>
                <Text className="text-white font-bold">₹150</Text>
              </View>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS ROW */}
        <View className="flex-row justify-between mb-6">
          <ActionButton 
            icon="arrow-down-outline" 
            color="#10B981" 
            label="Received" 
            onPress={() => navigation.navigate('Capture')} 
          />
          <ActionButton 
            icon="arrow-up-outline" 
            color="#F43F5E" 
            label="Paid" 
            onPress={() => navigation.navigate('Capture')} 
          />
          <ActionButton 
            icon="swap-horizontal" 
            color="#3B82F6" 
            label="Transfer" 
            onPress={() => navigation.navigate('Capture')} 
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
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-bold text-lg">Auto-Captured (SMS)</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Capture')}>
             <Text className="text-emerald-500 text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        {/* List Item */}
        <View className="bg-[#1E293B] p-4 rounded-xl flex-row items-center mb-20">
          <View className="bg-slate-700 h-10 w-10 rounded-full items-center justify-center mr-3">
             <MaterialCommunityIcons name="motorbike" size={20} color="#F472B6" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base">Swiggy Payout</Text>
            <Text className="text-gray-500 text-xs">Via SMS • 2:34 PM</Text>
          </View>
          <Text className="text-emerald-400 font-bold text-base">+₹847</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}