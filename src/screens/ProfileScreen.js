import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Image, Switch, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// --- HELPERS ---

const StatBox = ({ icon, value, label, color }) => (
  <View className="bg-[#1E293B] flex-1 p-3 rounded-2xl items-center border border-slate-700/50">
    <MaterialCommunityIcons name={icon} size={20} color={color} style={{marginBottom: 4}} />
    <Text className="text-white font-bold text-lg">{value}</Text>
    <Text className="text-slate-400 text-[10px] text-center">{label}</Text>
  </View>
);

const QuickAccessItem = ({ icon, label, color, bg }) => (
  <TouchableOpacity className="items-center w-[22%]">
    <View style={{ backgroundColor: bg }} className="w-12 h-12 rounded-full items-center justify-center mb-2">
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text className="text-slate-300 text-xs font-medium">{label}</Text>
  </TouchableOpacity>
);

const SettingRow = ({ icon, label, subLabel, type = 'arrow', value, onToggle, onPress, color = "#94A3B8" }) => (
  <TouchableOpacity 
    className="flex-row items-center justify-between py-4 border-b border-slate-800/50"
    activeOpacity={type === 'toggle' ? 1 : 0.7}
    onPress={type === 'toggle' ? onToggle : onPress}
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-3">
        <MaterialCommunityIcons name={icon} size={20} color={value ? color : "#64748B"} />
      </View>
      <View>
        <Text className={`font-medium text-base ${value !== false ? 'text-slate-200' : 'text-slate-500'}`}>{label}</Text>
        {subLabel && <Text className="text-slate-500 text-xs">{subLabel}</Text>}
      </View>
    </View>
    
    {type === 'arrow' && <Ionicons name="chevron-forward" size={20} color="#475569" />}
    {type === 'chevron-down' && <Ionicons name="chevron-down" size={20} color="#475569" />}
    {type === 'chevron-up' && <Ionicons name="chevron-up" size={20} color="#10B981" />}
    
    {type === 'toggle' && (
      <Switch 
        trackColor={{ false: "#334155", true: "#10B981" }}
        thumbColor={"#fff"}
        ios_backgroundColor="#334155"
        value={value}
        onValueChange={onToggle}
      />
    )}
  </TouchableOpacity>
);


export default function ProfileScreen() {
  const navigation = useNavigation();
  
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  

  const LANGUAGES = ["Hindi (हिंदी)", "English", "Marathi (मराठी)"];
  const [selectedLang, setSelectedLang] = useState("Hindi (हिंदी)");
  const [isLangOpen, setIsLangOpen] = useState(false); // for dropdown
  
  
  const [swiggyConnected, setSwiggyConnected] = useState(true);
  const [uberConnected, setUberConnected] = useState(true);
  const [bankConnected, setBankConnected] = useState(true);

  const handleSourceToggle = (sourceName, currentState, setter) => {
    if (currentState) {
      setter(false);
    } else {
      setter(true);
      Alert.alert("Connected", `${sourceName} SMS parsing is active.`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        
        {/*  PROFILE HEADER */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-emerald-500 rounded-full mb-3 border-4 border-[#1E293B] items-center justify-center relative shadow-lg shadow-emerald-500/20">
             <Image 
               source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }} 
               className="w-16 h-16"
             />
             <View className="absolute bottom-0 right-0 bg-[#1E293B] rounded-full p-1 border border-slate-700">
               <MaterialCommunityIcons name="pencil-circle" size={24} color="#10B981" />
             </View>
          </View>
          <Text className="text-white text-2xl font-bold">Raju Sharma</Text>
          <Text className="text-slate-400 text-sm mb-3">Swiggy & Uber Delivery Partner</Text>
          
          <View className="flex-row space-x-3">
             <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex-row items-center">
                <MaterialCommunityIcons name="star" size={12} color="#10B981" style={{marginRight:4}} />
                <Text className="text-emerald-400 text-xs font-bold">Pro Saver</Text>
             </View>
             <View className="bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 flex-row items-center">
                <MaterialCommunityIcons name="medal" size={12} color="#A855F7" style={{marginRight:4}} />
                <Text className="text-purple-400 text-xs font-bold">Level 5</Text>
             </View>
          </View>
        </View>

        {/*  STATS GRID */}
        <View className="flex-row justify-between gap-3 mb-8">
          <StatBox icon="trending-up" value="₹28,450" label="This Month" color="#10B981" />
          <StatBox icon="calendar-check" value="156" label="Days Active" color="#60A5FA" />
          <StatBox icon="trophy-variant" value="23" label="Badges" color="#Facc15" />
        </View>

        {/*  QUICK ACCESS */}
        <View className="mb-8">
          <Text className="text-white font-bold text-lg mb-4">Quick Access</Text>
          <View className="bg-[#1E293B] p-5 rounded-3xl flex-row justify-between">
            <QuickAccessItem icon="bullseye-arrow" label="Goals" color="#F472B6" bg="#F472B620" />
            <QuickAccessItem icon="chart-timeline-variant" label="Heatmap" color="#60A5FA" bg="#60A5FA20" />
            <QuickAccessItem icon="book-open-page-variant" label="Stories" color="#A78BFA" bg="#A78BFA20" />
            <QuickAccessItem icon="alert-decagram" label="Risks" color="#Facc15" bg="#Facc1520" />
          </View>
        </View>

        {/* coach */}
        <View className="mb-8">
          <Text className="text-white font-bold text-lg mb-2">Coach Preferences</Text>
          <View className="bg-[#1E293B] px-4 rounded-3xl">
            <SettingRow icon="emoticon-happy-outline" label="Coach Persona" subLabel="Friendly" />
            
            {/* language dropdown*/}
            <SettingRow 
              icon="web" 
              label="Language" 
              subLabel={selectedLang} 
              type={isLangOpen ? "chevron-up" : "chevron-down"} 
              onPress={() => setIsLangOpen(!isLangOpen)}
            />
            
            {/* language option*/}
            {isLangOpen && (
              <View className="pl-14 pb-2 border-b border-slate-800/50">
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity 
                    key={lang} 
                    onPress={() => {
                      setSelectedLang(lang);
                      setIsLangOpen(false);
                    }}
                    className="flex-row items-center justify-between py-2 pr-4"
                  >
                    <Text className={`text-sm ${lang === selectedLang ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      {lang}
                    </Text>
                    {lang === selectedLang && <Ionicons name="checkmark" size={16} color="#10B981" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <SettingRow 
              icon="microphone-outline" 
              label="Voice Input" 
              subLabel={voiceEnabled ? "Enabled" : "Disabled"}
              type="toggle" 
              value={voiceEnabled} 
              onToggle={() => setVoiceEnabled(!voiceEnabled)} 
              color="#10B981"
            />
          </View>
        </View>

        {/* connections */}
        <View className="mb-8">
          <Text className="text-white font-bold text-lg mb-2">Connected Sources</Text>
          <View className="bg-[#1E293B] px-4 rounded-3xl">
            <SettingRow 
              icon="moped" 
              label="Swiggy SMS" 
              subLabel={swiggyConnected ? "Parsing Active" : "Disconnected"}
              type="toggle" 
              value={swiggyConnected}
              onToggle={() => handleSourceToggle('Swiggy', swiggyConnected, setSwiggyConnected)}
              color="#F472B6" 
            />
            <SettingRow 
              icon="car" 
              label="Uber SMS" 
              subLabel={uberConnected ? "Parsing Active" : "Disconnected"}
              type="toggle" 
              value={uberConnected}
              onToggle={() => handleSourceToggle('Uber', uberConnected, setUberConnected)}
              color="#Facc15" 
            />
            <SettingRow 
              icon="bank" 
              label="Bank SMS" 
              subLabel={bankConnected ? "Parsing Active" : "Disconnected"}
              type="toggle" 
              value={bankConnected}
              onToggle={() => handleSourceToggle('Bank', bankConnected, setBankConnected)}
              color="#60A5FA" 
            />
          </View>
        </View>

        {/*  general */}
        <View className="mb-10">
          <Text className="text-white font-bold text-lg mb-2">Settings</Text>
          <View className="bg-[#1E293B] px-4 rounded-3xl mb-6">
            <SettingRow icon="bell-outline" label="Notifications" />
            <SettingRow icon="shield-check-outline" label="Privacy & Security" />
            <SettingRow icon="help-circle-outline" label="Help & Support" />
          </View>

          {/* logout button */}
          <TouchableOpacity className="border border-red-500/30 bg-red-500/10 py-4 rounded-2xl flex-row items-center justify-center mb-10">
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" style={{marginRight: 8}} />
            <Text className="text-red-500 font-bold">Logout</Text>
          </TouchableOpacity>

          <Text className="text-slate-600 text-center text-xs pb-10">Version 1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}