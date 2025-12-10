import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// mock data
const NOTIFICATIONS = [

  { id: 1, section: 'Today', type: 'alert', title: 'Spending Alert!', message: 'Your fuel spending is 32% higher this week. Reduce 1 trip to save ₹120.', time: '2 min ago', buttons: true },
  { id: 2, section: 'Today', type: 'sms', title: 'Auto-captured: Swiggy', message: 'Detected ₹847 payout from SMS', time: '15 min ago', meta: { amount: '+₹847', tag: 'Delivery' } },
  { id: 3, section: 'Today', type: 'challenge', title: 'Challenge Reminder', message: "Don't forget! Skip one food order today to save ₹50 🍜", time: '1 hr ago', action: 'Mark Complete' },
  { id: 4, section: 'Today', type: 'tip', title: 'Smart Nudge', message: "It's Sunday! You usually spend ₹180 extra today. Be mindful of your budget 💪", time: '2 hr ago' },
  
  
  { id: 5, section: 'Yesterday', type: 'goals', title: 'Diwali Fund Update', message: "You're 47% towards your Diwali goal! Keep going 🎉", time: 'Yesterday', progress: 0.47 },
  { id: 6, section: 'Yesterday', type: 'milestone', title: 'Milestone! 🎊', message: "You've earned ₹25,000 this month - your best month yet!", time: 'Yesterday' },
  { id: 7, section: 'Yesterday', type: 'alert', title: 'Upcoming: EMI Due', message: "Your bike EMI of ₹3,500 is due in 12 days. Start saving!", time: 'Yesterday', icon: 'calendar' },

  
  { id: 8, section: 'This Week', type: 'badge', title: 'Badge Earned!', message: 'You earned "5-Day Streak" badge! Keep saving 💪', time: '3 days ago' },
  { id: 9, section: 'This Week', type: 'tip', title: 'Shift Insight', message: 'Saturday 7-10 PM gave you 40% more earnings this week!', time: '5 days ago' },
];

// filters
const FILTERS = [
  { id: 'All', label: 'All', icon: null },
  { id: 'alert', label: 'Alerts', icon: 'alert-triangle' },
  { id: 'tip', label: 'Tips', icon: 'lightbulb-on' },
  { id: 'goals', label: 'Goals', icon: 'target' },
  { id: 'sms', label: 'SMS', icon: 'message-processing' },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('All');

  // for fliter
  const filteredData = activeFilter === 'All' 
    ? NOTIFICATIONS 
    : NOTIFICATIONS.filter(n => n.type === activeFilter);

  // render different card styles based on type
  const renderCard = (item) => {
    //  alert
    if (item.type === 'alert' && item.buttons) {
      return (
        <View className="bg-[#2a1515] border border-red-900/50 p-4 rounded-2xl mb-3">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-red-500 items-center justify-center mr-3">
                <Ionicons name="warning" size={16} color="white" />
              </View>
              <Text className="text-red-400 font-bold text-base">{item.title}</Text>
            </View>
            <Text className="text-slate-500 text-xs">{item.time}</Text>
          </View>
          <Text className="text-slate-300 text-sm leading-5 mt-2 mb-3">{item.message}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity className="bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/50">
              <Text className="text-red-400 text-xs font-bold">View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-slate-800 px-4 py-2 rounded-lg">
              <Text className="text-slate-400 text-xs font-bold">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // captured sms 
    if (item.type === 'sms') {
      return (
        <View className="bg-[#1E293B] p-4 rounded-2xl mb-3 border-l-4 border-emerald-500 relative">
          <View className="absolute top-4 right-4">
             <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center mr-3">
              <MaterialCommunityIcons name="cellphone-text" size={16} color="#60A5FA" />
            </View>
            <View>
               <Text className="text-white font-bold text-base">{item.title}</Text>
               <Text className="text-slate-500 text-xs">{item.time}</Text>
            </View>
          </View>
          <Text className="text-slate-400 text-xs mb-3">{item.message}</Text>
          <View className="flex-row gap-2">
            <View className="bg-emerald-500/20 px-2 py-1 rounded">
              <Text className="text-emerald-400 text-xs font-bold">{item.meta.amount}</Text>
            </View>
            <View className="bg-slate-700 px-2 py-1 rounded flex-row items-center">
              <MaterialCommunityIcons name="moped" size={12} color="#F472B6" style={{marginRight:4}} />
              <Text className="text-slate-300 text-xs">{item.meta.tag}</Text>
            </View>
          </View>
        </View>
      );
    }

    //  challenge 
    if (item.type === 'challenge') {
      return (
        <View className="bg-[#2a1e12] border border-orange-900/50 p-4 rounded-2xl mb-3">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                <MaterialCommunityIcons name="fire" size={18} color="#F97316" />
              </View>
              <Text className="text-orange-400 font-bold text-base">{item.title}</Text>
            </View>
            <Text className="text-slate-500 text-xs">{item.time}</Text>
          </View>
          <Text className="text-slate-300 text-sm mb-3">{item.message}</Text>
          <TouchableOpacity className="bg-[#F97316] self-start px-4 py-2 rounded-lg">
            <Text className="text-[#2a1e12] font-bold text-xs">{item.action}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    //  nudge
    if (item.type === 'tip' && item.title === 'Smart Nudge') {
      return (
        <View className="bg-[#1e1b2e] border border-purple-900/50 p-4 rounded-2xl mb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-row">
              <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center mr-3">
                <MaterialCommunityIcons name="brain" size={18} color="white" />
              </View>
              <View className="flex-1 mr-4">
                <Text className="text-purple-300 font-bold text-base mb-1">{item.title}</Text>
                <Text className="text-slate-300 text-xs leading-5">{item.message}</Text>
              </View>
            </View>
            <Text className="text-slate-500 text-xs">{item.time}</Text>
          </View>
        </View>
      );
    }

    //  goals
    return (
      <View className="bg-[#1E293B] p-4 rounded-2xl mb-3 border border-slate-800">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 
              ${item.type === 'goals' ? 'bg-orange-500/20' : item.type === 'milestone' ? 'bg-emerald-500/20' : 'bg-slate-700'}
            `}>
              <MaterialCommunityIcons 
                name={item.type === 'goals' ? 'target' : item.type === 'milestone' ? 'trending-up' : item.icon || 'bell'} 
                size={16} 
                color={item.type === 'goals' ? '#F97316' : item.type === 'milestone' ? '#10B981' : '#94A3B8'} 
              />
            </View>
            <View>
               <Text className={`font-bold text-base ${item.type === 'milestone' ? 'text-emerald-400' : 'text-white'}`}>{item.title}</Text>
            </View>
          </View>
          <Text className="text-slate-500 text-xs">{item.time}</Text>
        </View>
        
        <Text className="text-slate-400 text-sm mb-2">{item.message}</Text>
        
        {/*  Goals */}
        {item.progress && (
          <View className="h-2 bg-slate-700 rounded-full mt-2">
            <View style={{ width: `${item.progress * 100}%` }} className="h-full bg-orange-500 rounded-full" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      {/*  HEADER */}
      <View className="flex-row justify-between items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-800 p-2 rounded-full">
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Notifications</Text>
        <TouchableOpacity>
          <Text className="text-emerald-500 text-xs font-bold">Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/*  FILTER SCROLL*/}
      <View className="h-14 mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {FILTERS.map((filter) => (
            <TouchableOpacity 
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-3 border 
                ${activeFilter === filter.id ? 'bg-[#10B981] border-[#10B981]' : 'bg-slate-800 border-slate-700'}`}
            >
              {filter.icon && <MaterialCommunityIcons name={filter.icon} size={14} color={activeFilter === filter.id ? '#0F172A' : '#94A3B8'} style={{ marginRight: 6 }} />}
              <Text className={`font-bold ${activeFilter === filter.id ? 'text-[#0F172A]' : 'text-slate-300'}`}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* NOTIFICATION  */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        
        {['Today', 'Yesterday', 'This Week'].map(section => {
          // item fromnsection that matches filter
          const items = filteredData.filter(item => item.section === section);
          if (items.length === 0) return null;

          return (
            <View key={section} className="mb-6">
              <Text className="text-slate-500 text-xs font-bold mb-3 uppercase">{section}</Text>
              {items.map(item => (
                <View key={item.id}>
                  {renderCard(item)}
                </View>
              ))}
            </View>
          );
        })}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}