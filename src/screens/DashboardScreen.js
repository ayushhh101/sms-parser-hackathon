import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, Alert, Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestPermissions, checkPermissions, fetchSMS, startSmsListener, getStats } from '../smsService';
import { formatMoney, timeAgo, parseSMS } from '../smsParser';
import { DEMO_SMS, generateRandomDemoSMS, DEMO_INSIGHTS } from '../demoData';

// Colors
const C = {
  bg: '#0f0f1a', card: '#1a1a2e', border: '#2d2d44',
  purple: '#6c5ce7', green: '#00b894', red: '#ff7675',
  yellow: '#fdcb6e', white: '#fff', gray: '#888',
};

// Category emojis
const EMOJI = {
  Banking: '🏦', UPI: '📱', Shopping: '🛒',
  Food: '🍔', Transport: '🚗', Other: '📋',
};

// Transaction Card
const TxCard = ({ item, onCopyOTP }) => {
  const isCredit = item.type === 'credit' || item.type === 'cashback';
  const color = isCredit ? C.green : item.type === 'debit' ? C.red : C.gray;

  return (
    <View style={s.card}>
      <View style={s.cardRow}>
        <Text style={s.emoji}>{EMOJI[item.category] || '📋'}</Text>
        <Text style={s.merchant} numberOfLines={1}>{item.merchant}</Text>
        <Text style={s.time}>{timeAgo(item.timestamp)}</Text>
      </View>

      <View style={s.cardRow}>
        <View style={[s.badge, { backgroundColor: color + '20' }]}>
          <Text style={[s.badgeText, { color }]}>{item.type.toUpperCase()}</Text>
        </View>
        {item.amount && (
          <Text style={[s.amount, { color }]}>
            {isCredit ? '+' : '-'}{formatMoney(item.amount)}
          </Text>
        )}
      </View>

      <Text style={s.preview} numberOfLines={2}>{item.message}</Text>

      <View style={s.cardRow}>
        {item.account && <Text style={s.info}>•••• {item.account}</Text>}
        {item.balance && <Text style={s.info}>Bal: {formatMoney(item.balance)}</Text>}
        {item.discount && <Text style={[s.info, { color: C.yellow }]}>{item.discount}% OFF</Text>}
      </View>

      {item.isOTP && (
        <View style={s.otpBox}>
          <Text style={s.otpLabel}>OTP</Text>
          <Text style={s.otpCode}>{item.otp}</Text>
          <TouchableOpacity style={s.copyBtn} onPress={() => onCopyOTP(item.otp)}>
            <Text style={s.copyText}>COPY</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Stats Bar
const Stats = ({ stats }) => (
  <View style={s.stats}>
    <View style={s.statBox}>
      <Text style={s.statLabel}>Money In</Text>
      <Text style={[s.statVal, { color: C.green }]}>{formatMoney(stats.totalIn)}</Text>
    </View>
    <View style={s.statBox}>
      <Text style={s.statLabel}>Money Out</Text>
      <Text style={[s.statVal, { color: C.red }]}>{formatMoney(stats.totalOut)}</Text>
    </View>
    <View style={s.statBox}>
      <Text style={s.statLabel}>Cashback</Text>
      <Text style={[s.statVal, { color: C.yellow }]}>{formatMoney(stats.totalCashback)}</Text>
    </View>
  </View>
);

// Filter Tabs
const Filters = ({ active, onSelect }) => {
  const tabs = ['All', 'Debits', 'Credits', 'OTPs'];
  return (
    <View style={s.filters}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t}
          style={[s.tab, active === t && s.tabActive]}
          onPress={() => onSelect(t)}
        >
          <Text style={[s.tabText, active === t && s.tabTextActive]}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function DashboardScreen() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalIn: 0, totalOut: 0, totalCashback: 0, count: 0 });
  const [demoMode, setDemoMode] = useState(true);
  const [currentInsight, setCurrentInsight] = useState(0);

  // Load demo data on mount
  useEffect(() => {
    loadDemoData();
  }, []);

  // Apply filter
  useEffect(() => {
    let result = [...transactions];
    if (filter === 'Debits') result = result.filter(t => t.type === 'debit');
    else if (filter === 'Credits') result = result.filter(t => t.type === 'credit' || t.type === 'cashback');
    else if (filter === 'OTPs') result = result.filter(t => t.isOTP);
    setFiltered(result);
  }, [transactions, filter]);

  // Load demo data
  const loadDemoData = () => {
    const demoTransactions = DEMO_SMS.map(sms => 
      parseSMS(sms.body, sms.sender, sms.timestamp)
    );
    setTransactions(demoTransactions);
    setStats(getStats(demoTransactions));
  };

  // Add random demo SMS
  const addRandomDemo = () => {
    const newSms = generateRandomDemoSMS();
    const parsed = parseSMS(newSms.body, newSms.sender, newSms.timestamp);
    setTransactions(prev => {
      const updated = [parsed, ...prev];
      setStats(getStats(updated));
      return updated;
    });
    Alert.alert('📩 New Demo SMS', `From: ${newSms.sender}\n${newSms.body.substring(0, 80)}...`);
  };

  // Cycle insights
  const showNextInsight = () => {
    setCurrentInsight((prev) => (prev + 1) % DEMO_INSIGHTS.length);
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    loadDemoData();
    setRefreshing(false);
  }, []);

  // Copy OTP
  const copyOTP = (otp) => {
    Clipboard.setString(otp);
    Alert.alert('✅ Copied!', `OTP ${otp} copied to clipboard`);
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.logo}>💰 {demoMode ? 'Demo Mode' : 'SMS Parser'}</Text>
          <Text style={s.count}>{transactions.length} transactions</Text>
        </View>
        {demoMode && (
          <TouchableOpacity style={s.addDemoBtn} onPress={addRandomDemo}>
            <Text style={s.addDemoText}>+ Add Demo SMS</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Demo Insight Banner */}
      {demoMode && (
        <TouchableOpacity style={s.insightBanner} onPress={showNextInsight}>
          <Text style={s.insightText}>{DEMO_INSIGHTS[currentInsight].message}</Text>
          <Text style={s.insightHint}>Tap for next insight</Text>
        </TouchableOpacity>
      )}

      <Stats stats={stats} />
      <Filters active={filter} onSelect={setFilter} />

      {/* Transaction List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TxCard item={item} onCopyOTP={copyOTP} />}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.purple} />
        }
        ListEmptyComponent={
          <View style={s.center}>
            <Text style={s.bigEmoji}>📭</Text>
            <Text style={s.subtitle}>No transactions found</Text>
            {demoMode && (
              <TouchableOpacity style={s.btn} onPress={addRandomDemo}>
                <Text style={s.btnText}>Add Demo Transaction</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Styles
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { padding: 16, borderBottomWidth: 1, borderColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 24, fontWeight: 'bold', color: C.white },
  count: { fontSize: 13, color: C.gray, marginTop: 4 },
  
  // Stats
  stats: { flexDirection: 'row', padding: 12, gap: 8 },
  statBox: { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 12, alignItems: 'center' },
  statLabel: { fontSize: 11, color: C.gray },
  statVal: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  
  // Filters
  filters: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card },
  tabActive: { backgroundColor: C.purple },
  tabText: { fontSize: 13, color: C.gray },
  tabTextActive: { color: C.white, fontWeight: '600' },
  
  // List
  list: { padding: 12 },
  
  // Card
  card: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  emoji: { fontSize: 18 },
  merchant: { flex: 1, fontSize: 15, fontWeight: '600', color: C.white },
  time: { fontSize: 11, color: C.gray },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  amount: { fontSize: 18, fontWeight: 'bold', marginLeft: 'auto' },
  preview: { fontSize: 12, color: C.gray, lineHeight: 18, marginBottom: 8 },
  info: { fontSize: 11, color: C.gray },
  
  // OTP
  otpBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.purple + '20', padding: 10, borderRadius: 10, marginTop: 8 },
  otpLabel: { fontSize: 11, fontWeight: 'bold', color: C.purple },
  otpCode: { fontSize: 22, fontWeight: 'bold', color: C.white, letterSpacing: 3, flex: 1, marginLeft: 10 },
  copyBtn: { backgroundColor: C.purple, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  copyText: { fontSize: 11, fontWeight: 'bold', color: C.white },
  
  // Empty & Permission
  bigEmoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: C.white, marginBottom: 8 },
  subtitle: { fontSize: 15, color: C.gray, textAlign: 'center' },
  btn: { backgroundColor: C.purple, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  btnText: { fontSize: 16, fontWeight: '600', color: C.white },
  
  // Demo Mode
  addDemoBtn: { backgroundColor: C.purple + '30', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addDemoText: { fontSize: 12, fontWeight: '600', color: C.purple },
  insightBanner: { backgroundColor: C.purple + '20', borderLeftWidth: 4, borderColor: C.purple, padding: 12, marginHorizontal: 12, marginBottom: 8, borderRadius: 8 },
  insightText: { fontSize: 14, fontWeight: '600', color: C.white, marginBottom: 4 },
  insightHint: { fontSize: 11, color: C.gray, fontStyle: 'italic' },
});