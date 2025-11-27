import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, TextInput, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// --- HELPER: Quick Action Card ---
const QuickAction = ({ icon, title, subtitle, color }) => (
  <TouchableOpacity className="bg-[#1E293B] p-3 rounded-xl flex-1 mr-2 border border-slate-700/50">
    <View className={`w-8 h-8 rounded-full items-center justify-center mb-2 bg-slate-800`}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
    </View>
    <Text className="text-white font-bold text-xs mb-1">{title}</Text>
    <Text className="text-slate-500 text-[10px] leading-3">{subtitle}</Text>
  </TouchableOpacity>
);

export default function CoachScreen() {
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('Hindi');

  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    
    const payload = {
      userId: "101",
      message: inputText,       // User's Query
      language: language,       // Selected Language
      timestamp: new Date().toISOString()
    };
    console.log("🚀 CHAT SENDING:", JSON.stringify(payload, null, 2));

    // ---------------------------------------------------------
    //  UNCOMMENT ON SUNDAY (Real Backend) 
    // ---------------------------------------------------------
    /*
    try {
      const response = await fetch('http://192.168.1.5:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log("✅ AI Reply:", data);
    } catch (error) {
      console.error("❌ Connection Failed:", error);
      Alert.alert("Error", "Coach is offline");
    }
    */
    
    setInputText('');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
    
      <View className="px-5 pt-4 pb-4 border-b border-slate-800/50">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center mr-3 border-2 border-white/10">
               <Image 
                 source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712009.png' }} 
                 className="w-6 h-6"
                 tintColor="#0F172A"
               />
            </View>
            <View>
              <Text className="text-white text-lg font-bold">Money Coach</Text>
              <Text className="text-emerald-400 text-xs">AI Assistant • {language}</Text>
            </View>
          </View>
          <TouchableOpacity className="bg-slate-800 p-2 rounded-full">
            <Ionicons name="settings-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        
        
        <View className="flex-row mb-6">
          <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center mr-2 mt-1">
             <Ionicons name="person" size={14} color="#0F172A" />
          </View>
          <View className="bg-[#1E293B] p-4 rounded-2xl rounded-tl-none max-w-[85%] border border-slate-700/50">
            <Text className="text-emerald-400 font-bold mb-2">Namaste Raju! 👋</Text>
            <Text className="text-slate-200 leading-5 mb-3">
              Aaj ka din kaisa raha? Maine dekha ki aapne subah se ₹2,340 kamaye hain.
            </Text>
          </View>
        </View>

        
        <View className="flex-row mb-6 px-2">
          <QuickAction icon="sack" title="Savings tips" subtitle="Aur paisa kaise bachau?" color="#Facc15" />
          <QuickAction icon="chart-bar" title="My progress" subtitle="Is mahine kaisa raha?" color="#60A5FA" />
          <QuickAction icon="target" title="Goal update" subtitle="Diwali fund status" color="#F472B6" />
        </View>

        
        <View className="flex-row mb-24">
          <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center mr-2 mt-1">
             <Ionicons name="person" size={14} color="#0F172A" />
          </View>
          <View className="bg-[#3B0764] p-4 rounded-2xl rounded-tl-none max-w-[90%] border border-purple-500/30">
            <View className="flex-row items-center mb-2">
               <MaterialCommunityIcons name="star-four-points" size={16} color="#D8B4FE" />
               <Text className="text-purple-200 text-xs font-bold ml-1">Learning from you</Text>
            </View>
            <Text className="text-white text-sm leading-5 mb-4">
              Maine notice kiya ki aap Sunday ko zyada spend karte ho.
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity className="bg-[#6B21A8] px-4 py-2 rounded-lg">
                <Text className="text-white font-bold text-xs">Haan, bhejo</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-slate-800/50 px-4 py-2 rounded-lg">
                <Text className="text-slate-300 font-bold text-xs">Nahi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>

      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="absolute bottom-0 left-0 right-0 bg-[#0F172A] pt-2 pb-8 border-t border-slate-800"
      >
        
        <View className="flex-row px-4 mb-3 space-x-3">
          {['Hindi', 'English', 'Marathi'].map((lang) => (
            <TouchableOpacity 
              key={lang}
              onPress={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full ${language === lang ? 'bg-emerald-500' : 'bg-slate-800'}`}
            >
              <Text className={`text-xs font-bold ${language === lang ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                {lang === 'Hindi' ? 'हिंदी' : lang === 'Marathi' ? 'मराठी' : lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row items-center px-4 gap-3">
        
          <TouchableOpacity className="w-12 h-12 bg-[#7C3AED] rounded-full items-center justify-center shadow-lg shadow-purple-500/50">
            <Ionicons name="mic" size={24} color="white" />
          </TouchableOpacity>

         
          <View className="flex-1 bg-slate-800 rounded-full px-5 py-3 border border-slate-700 flex-row items-center">
            <TextInput 
              placeholder="Type or speak..."
              placeholderTextColor="#64748B"
              className="flex-1 text-white text-base"
              value={inputText}
              onChangeText={setInputText}
            />
          </View>

         
          <TouchableOpacity onPress={handleSendMessage} className="w-12 h-12 bg-[#10B981] rounded-full items-center justify-center">
            <Ionicons name="send" size={20} color="#0F172A" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}