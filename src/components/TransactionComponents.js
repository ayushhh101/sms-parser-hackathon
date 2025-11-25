import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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

export const TxCard = ({ item, onCopyOTP }) => {
  const isCredit = item.type === 'credit' || item.type === 'cashback';
  const color = isCredit ? C.green : item.type === 'debit' ? C.red : C.gray;

  return (
    <View style={s.card}>
      <View style={s.cardRow}>
        <Text style={s.emoji}>{EMOJI[item.category] || '📋'}</Text>
        <Text style={s.merchant} numberOfLines={1}>{item.merchant}</Text>
        <Text style={s.time}>{item.timestamp}</Text>
      </View>

      <View style={s.cardRow}>
        <View style={[s.badge, { backgroundColor: color + '20' }]}>
          <Text style={[s.badgeText, { color }]}>{item.type.toUpperCase()}</Text>
        </View>
        {item.amount && (
          <Text style={[s.amount, { color }]}>
            {isCredit ? '+' : '-'}₹{item.amount}
          </Text>
        )}
      </View>

      <Text style={s.preview} numberOfLines={2}>{item.message}</Text>

      <View style={s.cardRow}>
        {item.account && <Text style={s.info}>•••• {item.account}</Text>}
        {item.balance && <Text style={s.info}>Bal: ₹{item.balance}</Text>}
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

export const Stats = ({ stats }) => (
  <View style={s.stats}>
    <View style={s.statBox}>
      <Text style={s.statLabel}>Money In</Text>
      <Text style={[s.statVal, { color: C.green }]}>₹{stats.totalIn}</Text>
    </View>
    <View style={s.statBox}>
      <Text style={s.statLabel}>Money Out</Text>
      <Text style={[s.statVal, { color: C.red }]}>₹{stats.totalOut}</Text>
    </View>
    <View style={s.statBox}>
      <Text style={s.statLabel}>Cashback</Text>
      <Text style={[s.statVal, { color: C.yellow }]}>₹{stats.totalCashback}</Text>
    </View>
  </View>
);

export const Filters = ({ active, onSelect }) => {
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

const s = StyleSheet.create({
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
});