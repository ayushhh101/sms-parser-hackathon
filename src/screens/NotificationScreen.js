import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { getApiUrl } from '../utils/apiConfig';

// --- FILTERS ---
const FILTERS = [
  { id: 'All', label: 'All', icon: null },
  { id: 'alert', label: 'Alerts', icon: 'alert' },
  { id: 'tip', label: 'Tips', icon: 'lightbulb-on' },
  { id: 'transaction', label: 'Trans', icon: 'bank-transfer' }, 
  { id: 'goals', label: 'Goals', icon: 'target' },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // ---  LOAD USER & FETCH DATA ---
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const uid = userData.userId || userData._id;
        setUserId(uid);
        fetchNotifications(uid);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setLoading(false);
    }
  };

  const fetchNotifications = async (uid) => {
    try {
      const response = await fetch(getApiUrl(`/notifications/${uid}`));
      const result = await response.json();

      if (result.success && result.data) {
        const formattedData = result.data.map(item => formatNotification(item));
        setNotifications(formattedData);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- HANDLE MARK ALL READ ---
  const handleMarkAllRead = async () => {
    if (!userId) return;

    //  Optimistic Update: Immediately make everything look read in the UI
    setNotifications(prevNotifications => 
      prevNotifications.map(n => ({ ...n, isRead: true }))
    );

    try {
      //  Call the Backend
      const response = await fetch(getApiUrl(`/notifications/mark-read/${userId}`), {
        method: 'PUT',
      });
      const data = await response.json();
      
      if (!data.success) {
        // If it fails, revert (optional, or just alert)
        console.error("Failed to mark read on server");
      }
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };


  
  const formatNotification = (item) => {
    const timeMoment = moment(item.timestamp);
    let section = 'Earlier';
    
    // Grouping Logic
    if (timeMoment.isSame(moment(), 'day')) section = 'Today';
    else if (timeMoment.isSame(moment().subtract(1, 'days'), 'day')) section = 'Yesterday';
    else if (timeMoment.isSame(moment(), 'week')) section = 'This Week';

    // Map Backend 'msg_type' to UI 'type'
    let uiType = 'alert'; // Default
    let icon = 'bell';
    
    // Logic to categorize based on your DB examples
    if (item.msg_type === 'transaction') {
       uiType = 'transaction';
       icon = 'swap-horizontal';
    } else if (item.msg_type === 'admin_side') {
       // Check content for keywords to refine type
       if (item.msg_content.includes('limit') || item.msg_content.includes('Alert')) uiType = 'alert';
       else if (item.msg_content.includes('goal')) uiType = 'goals';
       else uiType = 'tip';
    }

    // Extract Amount if Transaction
    let meta = null;
    if (uiType === 'transaction') {
       
        meta = { 
            amount: item.msg_head, 
            tag: item.msg_content 
        };
    }

    return {
      id: item._id,
      section: section,
      type: uiType,
      title: item.msg_head,
      message: item.msg_content,
      time: timeMoment.fromNow(), 
      rawTime: item.timestamp,    
      meta: meta,
      buttons: uiType === 'alert', 
      icon: icon,
      isRead: item.isRead || false,
    };
  };

  // ---  FILTER LOGIC ---
  const filteredData = activeFilter === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === activeFilter);

  const handleRefresh = () => {
     setRefreshing(true);
     if(userId) fetchNotifications(userId);
  };

  // ---  RENDER CARDS ---
  const renderCard = (item) => {

    const UnreadDot = () => (
      !item.isRead ? (
        <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full z-10 border border-[#1E293B]" />
      ) : null
    );

    // ALERT CARD
    if (item.type === 'alert') {
      return (
        <View className="bg-[#2a1515] border border-red-900/50 p-4 rounded-2xl mb-3">
          <UnreadDot />
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-row items-center flex-1 mr-2">
        
              <View className="w-8 h-8 rounded-full bg-red-500 items-center justify-center mr-3">
                <Ionicons name="warning" size={16} color="white" />
              </View>
              <Text className="text-red-400 font-bold text-base flex-1" numberOfLines={1}>{item.title}</Text>
            </View>
            <Text className="text-slate-500 text-xs">{item.time}</Text>
          </View>
          <Text className="text-slate-300 text-sm leading-5 mt-2 mb-3">{item.message}</Text>
          {item.buttons && (
             <View className="flex-row gap-3">
                <TouchableOpacity className="bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/50">
                   <Text className="text-red-400 text-xs font-bold">View Details</Text>
                </TouchableOpacity>
             </View>
          )}
        </View>
      );
    }

    // TRANSACTION CARD: color tag red for negative amounts, green otherwise
    if (item.type === 'transaction') {
      const amountStr = item.meta?.amount || '';
      const isExpense = amountStr.includes('-');

      return (
        <View className={`bg-[#1E293B] p-4 rounded-2xl mb-3 border-l-4 ${isExpense ? 'border-red-500' : 'border-emerald-500'} relative`}>
          <UnreadDot />
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center mr-3">
              <MaterialCommunityIcons name="bank-transfer" size={16} color="#60A5FA" />
            </View>
            <View className="flex-1">
               <Text className={`${isExpense ? 'text-red-300' : 'text-emerald-300'} text-xs font-bold`}>{item.title}</Text>
               <Text className="text-slate-500 text-xs">{item.time}</Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2 mb-2">
            <View className={`${isExpense ? 'bg-red-500/20' : 'bg-emerald-500/20'} px-2 py-1 rounded`}>
              <Text className={`${isExpense ? 'text-red-400' : 'text-emerald-400'} text-xs font-bold`}>{item.meta?.tag || 'Transaction'}</Text>
            </View>

            <View className={`${isExpense ? 'bg-red-500/10' : 'bg-emerald-500/10'} px-2 py-1 rounded`}>
              
            </View>
          </View>

          <View className="bg-slate-700/50 px-2 py-1 rounded self-start">
             <Text className="text-slate-300 text-xs">Auto-tracked</Text>
          </View>
        </View>
      );
    }

    // TIP / NUDGE CARD
    if (item.type === 'tip') {
      return (
        <View className="bg-[#1e1b2e] border border-purple-900/50 p-4 rounded-2xl mb-3">
          <UnreadDot />
          <View className="flex-row justify-between items-start">
            <View className="flex-row flex-1">
              <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center mr-3">
                <MaterialCommunityIcons name="brain" size={18} color="white" />
              </View>
              <View className="flex-1 mr-2">
                <Text className="text-purple-300 font-bold text-base mb-1">{item.title}</Text>
                <Text className="text-slate-300 text-xs leading-5">{item.message}</Text>
              </View>
            </View>
            <Text className="text-slate-500 text-xs">{item.time}</Text>
          </View>
        </View>
      );
    }

    // DEFAULT / GENERIC CARD
    return (
      <View className="bg-[#1E293B] p-4 rounded-2xl mb-3 border border-slate-800">
        <UnreadDot />
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center mr-3">
              <MaterialCommunityIcons name="bell" size={16} color="#94A3B8" />
            </View>
            <Text className="text-white font-bold text-base flex-1" numberOfLines={1}>{item.title}</Text>
          </View>
          <Text className="text-slate-500 text-xs">{item.time}</Text>
        </View>
        <Text className="text-slate-400 text-sm">{item.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-800 p-2 rounded-full">
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text className="text-emerald-500 text-xs font-bold">Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER SCROLL */}
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

      {/* NOTIFICATION LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" className="mt-10" />
      ) : (
        <ScrollView 
            className="flex-1 px-5" 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
            {notifications.length === 0 ? (
                <Text className="text-slate-500 text-center mt-10">No notifications yet</Text>
            ) : (
                ['Today', 'Yesterday', 'This Week', 'Earlier'].map(section => {
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
                })
            )}
            <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}