import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { getApiUrl } from '../utils/apiConfig';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];
const CATEGORIES = [
  { id: 'delivery', name: 'Delivery', icon: 'moped', lib: 'MaterialCommunityIcons' },
  { id: 'fuel', name: 'Fuel', icon: 'gas-pump', lib: 'FontAwesome5' },
  { id: 'food', name: 'Food', icon: 'fast-food', lib: 'Ionicons' },
  { id: 'chai', name: 'Chai', icon: 'coffee', lib: 'FontAwesome5' },
  { id: 'recharge', name: 'Recharge', icon: 'cellphone-charging', lib: 'MaterialCommunityIcons' },
  { id: 'transport', name: 'Transport', icon: 'bus', lib: 'FontAwesome5' },
  { id: 'repair', name: 'Repair', icon: 'tools', lib: 'FontAwesome5' },
  { id: 'family', name: 'Family', icon: 'people', lib: 'Ionicons' },
];

const TabButton = ({ title, icon, isActive, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`flex-1 flex-row items-center justify-center py-3 rounded-xl space-x-2 
      ${isActive ? 'bg-[#10B981]' : 'bg-transparent'}`}
  >
    <Ionicons name={icon} size={16} color={isActive ? "white" : "#94A3B8"} style={{marginRight: 6}} />
    <Text className={`font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
      {title}
    </Text>
  </TouchableOpacity>
);

const PlatformRow = ({ iconLib, iconName, color, name }) => (
  <View className="flex-row items-center justify-between py-4 border-b border-slate-800/50">
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full items-center justify-center bg-slate-800 mr-3">
        {iconLib === 'Ionicons' && <Ionicons name={iconName} size={20} color={color} />}
        {iconLib === 'Material' && <MaterialCommunityIcons name={iconName} size={20} color={color} />}
        {iconLib === 'FontAwesome5' && <FontAwesome5 name={iconName} size={16} color={color} />}
      </View>
      <Text className="text-slate-200 font-medium text-base">{name}</Text>
    </View>
    <View className="w-6 h-6 rounded-full border border-emerald-500 items-center justify-center">
      <Ionicons name="checkmark" size={14} color="#10B981" />
    </View>
  </View>
);

const CaptureCard = ({ title, subtitle, amount, type, rawText, icon, color }) => (
  <View className="bg-[#1E293B] p-4 rounded-2xl mb-4 border-l-4" style={{ borderLeftColor: type === 'credit' ? '#10B981' : '#EF4444' }}>
    <View className="flex-row justify-between items-center mb-3">
      <View className="flex-row items-center">
         <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            <Ionicons name={icon} size={20} color={color} />
         </View>
         <View>
           <Text className="text-white font-bold text-base">{title}</Text>
           <Text className="text-slate-500 text-xs">{subtitle}</Text>
         </View>
      </View>
      <Text className={`font-bold text-lg ${type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
        {amount}
      </Text>
    </View>
    <View className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
      <Text className="text-slate-400 text-xs font-mono italic" numberOfLines={2}>
        "{rawText}"
      </Text>
    </View>
  </View>
);

export default function CaptureScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('SMS'); 
  const [loading, setLoading] = useState(false);

  // audio recording statess
  const [recording, setRecording] = useState(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Manual Form State
  const [txType, setTxType] = useState('paid');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [manualEntries, setManualEntries] = useState([]);
  const [filter, setFilter] = useState("all");

  // ===================================================
  // AUDIO LOGIC
  // ===================================================

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Error", "Could not access microphone");
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    if (!recording) return;

    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    
    const uri = recording.getURI(); 
    console.log('Recording stopped and stored at', uri);

    if (uri) {
      uploadAudio(uri);
    }
  }

  const uploadAudio = async (uri) => {
    setIsUploadingAudio(true);
    
    const formData = new FormData();
    
    // Extract file extension to be safe (usually .m4a)
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri: uri,
      name: `voice_log_${Date.now()}.${fileType}`,
      type: `audio/${fileType}`, 
    });

    // Add extra fields if your backend needs them
    formData.append('userId', 'usr_rahul_001');

    try {
      const backendURL = getApiUrl("/transactions/voice-log"); 

      const res = await fetch(backendURL, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Voice log uploaded successfully!");
        console.log("Server Response:", data);
      } else {
        Alert.alert("Upload Failed", data.message || "Something went wrong");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Failed to upload audio");
    } finally {
      setIsUploadingAudio(false);
    }
  };


  // ===================================================
  // MANUAL LOGIC
  // ===================================================
  
  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }

    setLoading(true);

    const userId = "usr_rahul_001"; 
    const clientLocalId = `cl_${Date.now()}`;
    const txId = `tx_${Date.now()}`;

    // convert rupees → paise
    const amountPaise = Math.round(Number(amount) * 100);

    const payload = {
      txId,
      userId,
      clientLocalId,
      type: txType === "paid" ? "expense" : txType === "received" ? "income" : "transfer",
      amountPaise,
      category: selectedCategory,
      merchant: note?.trim() ? note.trim() : null, 
      method: paymentMode, 
      source: "manual",
      timestamp: new Date().toISOString(),
      notes: note || "",
      synced: false,
      parserMeta: {}
    };

    console.log("FINAL PAYLOAD:", payload);

    try {
      const backendURL = getApiUrl("/transactions/manual");

      const res = await fetch(backendURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Saved!", "Entry added successfully");
        setAmount("");
        setNote("");
        fetchManualEntries(); // Refresh list immediately
      } else {
        Alert.alert("Error", data.message || "Failed to save");
      }

    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Cannot reach server");
    }
    setLoading(false);
  };


  // Retrieve manual logs with filters
  const fetchManualEntries = async () => {
    try {
      const url = getApiUrl(`/transactions/manual-logs?userId=usr_rahul_001&filter=${filter}`);

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setManualEntries(data.transactions || []);
      }
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchManualEntries();
  }, [filter]);


  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-800 p-2 rounded-full mr-4">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Data Capture</Text>
        </View>

        {/* TAB SWITCHER */}
        <View className="flex-row bg-[#1E293B] p-1 rounded-2xl mb-6">
          <TabButton title="SMS" icon="chatbox-ellipses" isActive={activeTab === 'SMS'} onPress={() => setActiveTab('SMS')} />
          <TabButton title="Voice" icon="mic" isActive={activeTab === 'Voice'} onPress={() => setActiveTab('Voice')} />
          <TabButton title="Manual" icon="create" isActive={activeTab === 'Manual'} onPress={() => setActiveTab('Manual')} />
        </View>

        {/* SMS TAB CONTENT */}
        {activeTab === 'SMS' && (
          <View className="mb-10">
            {/* Main Status Card */}
            <View className="bg-[#1E293B] rounded-3xl p-5 mb-6 shadow-lg">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white text-lg font-bold">SMS Auto-Capture</Text>
                <View className="bg-emerald-500/20 px-3 py-1 rounded-full flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-emerald-400 text-xs font-bold">Active</Text>
                </View>
              </View>
              <Text className="text-slate-400 text-xs mb-6 leading-5">
                Automatically detects earnings & payments from SMS. No internet needed!
              </Text>
              
              {/* List of Platforms */}
              <PlatformRow iconLib="Material" iconName="moped" color="#F472B6" name="Swiggy Payouts" />
              <PlatformRow iconLib="FontAwesome5" iconName="hamburger" color="#FBBF24" name="Zomato Earnings" />
              <PlatformRow iconLib="Ionicons" iconName="car" color="#FACC15" name="Uber Cash Out" />
              <PlatformRow iconLib="Ionicons" iconName="car-sport" color="#F87171" name="Ola Earnings" />
              <PlatformRow iconLib="Material" iconName="bank" color="#94A3B8" name="Bank Alerts" />
              <PlatformRow iconLib="Material" iconName="cellphone-check" color="#60A5FA" name="UPI Transactions" />
            </View>

            {/* Recent Captures Header */}
            <Text className="text-white font-bold text-lg mb-4">Recent Captures</Text>
            
            <CaptureCard 
              title="Swiggy Payout"
              subtitle="Detected from SMS"
              amount="+₹847"
              type="credit"
              icon="arrow-down"
              color="#10B981"
              rawText="Rs 847.00 credited to your account for Swiggy delivery via NEFT..."
            />

            <CaptureCard 
              title="Petrol Pump"
              subtitle="Detected from SMS"
              amount="-₹500"
              type="debit"
              icon="arrow-up"
              color="#EF4444"
              rawText="Rs 500 debited from a/c XX1234 at HP PETROL PUMP via UPI..."
            />
          </View>
        )}

        
        {/* VOICE TAB CONTENT */}
        {activeTab === 'Voice' && (
           <View className="items-center justify-center py-20">
              {/* RECORD BUTTON */}
              <TouchableOpacity 
                onPress={recording ? stopRecording : startRecording}
                disabled={isUploadingAudio}
                className={`w-32 h-32 rounded-full items-center justify-center mb-6 shadow-lg 
                  ${recording 
                    ? 'bg-red-600 shadow-red-500/50 border-4 border-red-400' 
                    : 'bg-emerald-500 shadow-emerald-500/50'
                  }`}
              >
                 {isUploadingAudio ? (
                   <ActivityIndicator size="large" color="white" />
                 ) : (
                   <Ionicons 
                     name={recording ? "stop" : "mic"} 
                     size={50} 
                     color="white" 
                   />
                 )}
              </TouchableOpacity>

              {/* STATUS TEXT */}
              <Text className="text-white text-xl font-bold">
                {isUploadingAudio 
                  ? "Uploading..." 
                  : recording 
                    ? "Recording... Tap to Stop" 
                    : "Tap to Speak"}
              </Text>
              
              {/* INSTRUCTIONS */}
              {!recording && !isUploadingAudio && (
                <Text className="text-slate-400 text-center px-10 mt-2 leading-6">
                   Try saying: {"\n"}"I spent 50 rupees on tea"
                </Text>
              )}
           </View>
        )}

        {/* MANUAL TAB CONTENT */}
        {activeTab === 'Manual' && (
          <View className="mb-10">
            {/* TYPE SELECTOR */}
            <View className="flex-row justify-between mb-6 gap-3">
              <TouchableOpacity onPress={() => setTxType('received')} className={`flex-1 p-4 rounded-2xl items-center border-2 ${txType === 'received' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-[#1E293B] border-transparent'}`}>
                <Ionicons name="arrow-down" size={24} color="#10B981" />
                <Text className="text-emerald-500 font-bold mt-1">Received</Text>
                <Text className="text-slate-500 text-[10px]">Cash In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTxType('paid')} className={`flex-1 p-4 rounded-2xl items-center border-2 ${txType === 'paid' ? 'bg-red-500/10 border-red-500' : 'bg-[#1E293B] border-transparent'}`}>
                <Ionicons name="arrow-up" size={24} color="#EF4444" />
                <Text className="text-red-500 font-bold mt-1">Paid</Text>
                <Text className="text-slate-500 text-[10px]">Cash Out</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTxType('transfer')} className={`flex-1 p-4 rounded-2xl items-center border-2 ${txType === 'transfer' ? 'bg-blue-500/10 border-blue-500' : 'bg-[#1E293B] border-transparent'}`}>
                <Ionicons name="swap-horizontal" size={24} color="#3B82F6" />
                <Text className="text-blue-500 font-bold mt-1">Transfer</Text>
                <Text className="text-slate-500 text-[10px]">Move</Text>
              </TouchableOpacity>
            </View>

            {/* FORM CARD */}
            <View className="bg-[#1E293B] p-5 rounded-3xl">
              {/* AMOUNT */}
              <Text className="text-slate-400 text-xs mb-2 ml-1">Amount</Text>
              <View className="bg-slate-700/50 rounded-xl px-4 py-3 flex-row items-center mb-4">
                <Text className="text-emerald-500 text-2xl font-bold mr-2">₹</Text>
                <TextInput 
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  className="text-white text-3xl font-bold flex-1"
                />
              </View>

              {/* QUICK AMOUNTS */}
              <View className="flex-row flex-wrap gap-2 mb-6">
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity key={amt} onPress={() => setAmount(amt.toString())} className="bg-slate-700/50 px-4 py-2 rounded-lg">
                    <Text className="text-slate-300 font-medium">₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* NOTE */}
              <Text className="text-slate-400 text-xs mb-2 ml-1">Note (Optional)</Text>
              <TextInput value={note} onChangeText={setNote} placeholder="What was this for?" placeholderTextColor="#64748B" className="bg-slate-700/50 text-white p-4 rounded-xl mb-6" />

              {/* CATEGORIES */}
              <Text className="text-slate-400 text-xs mb-2 ml-1">Quick Categories</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)} className={`flex-row items-center px-3 py-2 rounded-full border ${selectedCategory === cat.id ? 'bg-slate-700 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>
                    {cat.lib === 'Ionicons' && <Ionicons name={cat.icon} size={14} color={selectedCategory === cat.id ? '#10B981' : '#94A3B8'} />}
                    {cat.lib === 'MaterialCommunityIcons' && <MaterialCommunityIcons name={cat.icon} size={14} color={selectedCategory === cat.id ? '#10B981' : '#94A3B8'} />}
                    {cat.lib === 'FontAwesome5' && <FontAwesome5 name={cat.icon} size={12} color={selectedCategory === cat.id ? '#10B981' : '#94A3B8'} />}
                    <Text className={`ml-2 text-xs font-medium ${selectedCategory === cat.id ? 'text-white' : 'text-slate-400'}`}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* PAYMENT MODE */}
              <Text className="text-slate-400 text-xs mb-2 ml-1">Payment Mode</Text>
              <View className="flex-row bg-slate-800 p-1 rounded-xl mb-2">
                {['cash', 'upi', 'card'].map((mode) => (
                  <TouchableOpacity key={mode} onPress={() => setPaymentMode(mode)} className={`flex-1 flex-row items-center justify-center py-3 rounded-lg space-x-2 ${paymentMode === mode ? 'bg-slate-700 shadow-sm' : 'bg-transparent'}`}>
                    <Ionicons name={mode === 'cash' ? "cash" : mode === 'upi' ? "qr-code" : "card"} size={16} color={paymentMode === mode ? "#10B981" : "#64748B"} style={{marginRight: 6}} />
                    <Text className={`font-medium ${paymentMode === mode ? 'text-white' : 'text-slate-400'}`}>{mode.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SAVE BUTTON */}
            <TouchableOpacity onPress={handleSave} className="bg-[#10B981] py-4 rounded-xl mt-6 items-center shadow-lg shadow-emerald-900/50">
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Entry</Text>}
            </TouchableOpacity>

            {/* RECENT MANUAL ENTRIES */}
            <View className="mt-8">
              {/* FILTER BUTTONS */}
              <View className="flex-row mb-4 bg-slate-800 p-1 rounded-xl">
                {["all", "week", "month"].map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      filter === f ? "bg-slate-700" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        filter === f ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {f === "all" ? "All" : f === "week" ? "1 Week" : "1 Month"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-white font-bold text-lg mb-3">
                Recent Manual Entries
              </Text>

              {manualEntries.length === 0 && (
                <Text className="text-slate-500 text-center py-4">
                  No manual entries found
                </Text>
              )}

              {/* ENTRY LIST */}
              {manualEntries.map((item) => {
                const isExpense = item.type === 'expense';
                const isTransfer = item.type === 'transfer';

                let borderColor = 'border-emerald-500'; // Default: Income (Green)
                let textColor = 'text-emerald-400';
                let sign = '+';

                if (isExpense) {
                  borderColor = 'border-red-500';       // Expense (Red)
                  textColor = 'text-red-400';
                  sign = '-';
                } else if (isTransfer) {
                  borderColor = 'border-blue-500';      // Transfer (Blue)
                  textColor = 'text-blue-400';
                  sign = '';
                }

                return (
                  <View
                    key={item.txId}
                    // 2. Use the dynamic border color
                    className={`bg-[#1E293B] p-4 rounded-2xl mb-4 border-l-4 ${borderColor}`}
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <View>
                        <Text className="text-white font-bold capitalize text-base">
                          {item.category}
                        </Text>
                        <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                          {item.type} {/* Shows: INCOME / EXPENSE / TRANSFER */}
                        </Text>
                      </View>

                      {/* 3. Use the dynamic text color and sign */}
                      <Text className={`${textColor} font-bold text-lg`}>
                        {sign}₹{(item.amountPaise / 100).toFixed(2)}
                      </Text>
                    </View>

                    <Text className="text-slate-400 text-xs mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>

                    {item.notes ? (
                      <View className="bg-slate-800/50 p-2 rounded-lg mt-2">
                         <Text className="text-slate-400 text-xs italic">
                           "{item.notes}"
                         </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}