import React, { useState } from 'react';
import { 
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, 
  StatusBar, TextInput, Image, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste Rahul! 👋 Aaj ka din kaisa raha? Maine dekha ki aapne subah se ₹2,340 kamaye hain."
    }
  ]);

  const PYTHON_BACKEND_URL = "http://10.0.49.44:8000/query";

  // ---------------- SEND MESSAGE TO BACKEND ----------------
  const sendMessageToBackend = async (query) => {
    try {
      const payload = {
        userId: "usr_rahul_001",
        query: query,
        lang: "english"
      };

      console.log("🔥 Sending to Python backend:", payload);

      const res = await fetch(PYTHON_BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("📩 Backend Response:", data);

      return data?.response?.response || "No response received.";
    } catch (err) {
      console.log("❌ Backend Error:", err);
      return "Server error. Please try again.";
    }
  };

  // ---------------- HANDLE SEND MESSAGE ----------------
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;

    // Add User Message to chat
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInputText("");

    // Send to backend
    const botReply = await sendMessageToBackend(userMessage);

    // Add Backend Response to chat
    setMessages(prev => [...prev, { role: "assistant", text: botReply }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
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
            </View>
          </View>
        </View>
      </View>

      {/* Chat Scroll */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {messages.map((msg, index) => (
          <View 
            key={index}
            className={`flex-row mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center mr-2 mt-1">
                <Ionicons name="person" size={14} color="#0F172A" />
              </View>
            )}

            <View 
              className={`p-4 rounded-2xl max-w-[80%] border border-slate-700/50
                ${msg.role === "user" 
                  ? "bg-[#7C3AED] rounded-br-none" 
                  : "bg-[#1E293B] rounded-tl-none"
                }`
              }
            >
              <Text className="text-slate-200 leading-5">{msg.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Box */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="absolute bottom-0 left-0 right-0 bg-[#0F172A] pt-2 pb-8 border-t border-slate-800"
      >
        <View className="flex-row items-center px-4 gap-3">
          
          <TouchableOpacity className="w-12 h-12 bg-[#7C3AED] rounded-full items-center justify-center shadow-lg shadow-purple-500/50">
            <Ionicons name="mic" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 bg-slate-800 rounded-full px-5 py-3 border border-slate-700 flex-row items-center">
            <TextInput 
              placeholder="Type your question..."
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
