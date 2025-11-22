// OTP Input Component with Auto-fill
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { getLatestOTP, startSmsListener } from './smsService';

const C = {
  bg: '#1a1a2e', purple: '#6c5ce7', green: '#00b894',
  white: '#fff', gray: '#888', border: '#2d2d44',
};

export default function OtpInput({ length = 6, onComplete, autoFill = true }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const [focused, setFocused] = useState(0);
  const [autoFilled, setAutoFilled] = useState(false);
  const inputRefs = useRef([]);
  const scale = useRef(new Animated.Value(1)).current;

  // Listen for SMS
  useEffect(() => {
    if (!autoFill) return;

    const unsubscribe = startSmsListener((msg) => {
      if (msg.isOTP && msg.otp?.length === length) {
        fillOtp(msg.otp);
      }
    });

    // Also check recent OTPs
    getLatestOTP().then(code => {
      if (code?.length === length) fillOtp(code);
    });

    return unsubscribe;
  }, [autoFill, length]);

  // Auto-fill animation
  const fillOtp = (code) => {
    const digits = code.split('');
    setOtp(digits);
    setAutoFilled(true);
    
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    onComplete?.(code);
  };

  // Handle input
  const handleChange = (text, index) => {
    setAutoFilled(false);
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Move to next
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocused(index + 1);
    }

    // Check complete
    const code = newOtp.join('');
    if (code.length === length && !code.includes('')) {
      onComplete?.(code);
    }
  };

  // Handle backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
      setFocused(index - 1);
    }
  };

  // Clear
  const clear = () => {
    setOtp(Array(length).fill(''));
    setAutoFilled(false);
    inputRefs.current[0]?.focus();
    setFocused(0);
  };

  return (
    <View style={s.container}>
      {/* Auto-fill indicator */}
      <View style={s.indicator}>
        <View style={[s.dot, { backgroundColor: autoFill ? C.green : C.gray }]} />
        <Text style={s.indicatorText}>
          {autoFill ? 'Listening for OTP...' : 'Auto-fill disabled'}
        </Text>
      </View>

      {/* OTP Boxes */}
      <Animated.View style={[s.boxes, { transform: [{ scale }] }]}>
        {otp.map((digit, i) => (
          <View
            key={i}
            style={[
              s.box,
              focused === i && s.boxFocused,
              digit && s.boxFilled,
              autoFilled && s.boxAuto,
            ]}
          >
            <TextInput
              ref={el => inputRefs.current[i] = el}
              style={s.input}
              value={digit}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              onFocus={() => setFocused(i)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={i === 0}
            />
          </View>
        ))}
      </Animated.View>

      {/* Auto-filled banner */}
      {autoFilled && (
        <View style={s.banner}>
          <Text style={s.bannerText}>✓ OTP Auto-filled</Text>
          <TouchableOpacity onPress={clear}>
            <Text style={s.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },
  indicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  indicatorText: { fontSize: 12, color: C.gray },
  boxes: { flexDirection: 'row', gap: 10 },
  box: {
    width: 48, height: 56, borderRadius: 12, borderWidth: 2,
    borderColor: C.border, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center',
  },
  boxFocused: { borderColor: C.purple },
  boxFilled: { borderColor: C.purple, backgroundColor: C.purple + '15' },
  boxAuto: { borderColor: C.green, backgroundColor: C.green + '15' },
  input: { fontSize: 24, fontWeight: 'bold', color: C.white, textAlign: 'center', width: '100%', height: '100%' },
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.green + '20', borderRadius: 8, padding: 12, marginTop: 16, width: '100%',
  },
  bannerText: { color: C.green, fontWeight: '600' },
  clearText: { color: C.purple, fontWeight: '600' },
});