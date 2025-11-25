import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Mock phone number passed from LoginScreen
const MOCK_PHONE_NUMBER = "+91 8452983033"; 
const OTP_LENGTH = 6;

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);
  const navigation = useNavigation();
  // --- OTP Logic ---

  const handleChange = (text, index) => {
    // Only allow one digit
    if (text.length > 1) return;
    
    // Copy current OTP array
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus to the next input
    if (text !== "" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace logic to move to the previous input
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOtp = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length === OTP_LENGTH) {
      Keyboard.dismiss();
      console.log("Verifying OTP:", fullOtp);
      // Logic to navigate to the next screen (e.g., Home/Dashboard)
      navigation.navigate('Home')
    }
  };

  // --- Resend Timer Logic ---

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const resendOtp = () => {
    setTimer(30); // Reset timer
    setOtp(new Array(OTP_LENGTH).fill("")); // Clear OTP inputs
    inputRefs.current[0].focus(); // Focus the first input
    console.log("Resending OTP...");
  };
  
  const isOtpComplete = otp.every(digit => digit !== "");

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#b8b9c8" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Shield Icon Container */}
      <View style={styles.iconContainer}>
        <Ionicons name="shield-outline" size={32} color="white" />
      </View>

      {/* Title and Subtitle */}
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to
      </Text>
      <Text style={styles.phoneNumberText}>{MOCK_PHONE_NUMBER}</Text>

      {/* OTP Input Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            caretHidden={true} // Hides the cursor, standard for OTP boxes
          />
        ))}
      </View>

      {/* Resend Timer/Button */}
      <TouchableOpacity 
        onPress={resendOtp} 
        disabled={timer > 0}
        style={{ marginVertical: 20 }}
      >
        <Text style={[styles.resendText, timer > 0 && styles.disabledText]}>
          {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
        </Text>
      </TouchableOpacity>
      
      {/* Security Warning Box */}
      <View style={styles.warningBox}>
        <Ionicons name="shield-checkmark-outline" size={18} color="#ff8b3d" />
        <Text style={styles.warningText}>
          <Text style={{fontWeight: '700'}}>Never share your OTP with anyone.</Text> FinTrack will never ask for it.
        </Text>
      </View>

      {/* Verify Button */}
      <TouchableOpacity 
        style={styles.buttonWrapper} 
        onPress={verifyOtp}
        disabled={!isOtpComplete}
      >
        <LinearGradient
          colors={["#6d4cff", "#9b4dff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, !isOtpComplete && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Verify & Continue</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Footer Text */}
      <Text style={styles.footer}>
        By continuing, you agree to our{" "}
        <Text style={styles.linkText}>Terms & Privacy Policy</Text>
      </Text>
    </ScrollView>
  );
}

// --- Re-using and Adjusting Styles from LoginScreen ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B1E27", 
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  
  // Header and Back Button
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 50,
    marginBottom: 40,
  },
  backText: {
    color: "#b8b9c8",
    fontSize: 16,
    marginLeft: 28, // Offset the text next to the icon
    position: 'absolute',
    top: 0,
  },

  // Icon Container (Reused)
  iconContainer: {
    width: 68,
    height: 68,
    backgroundColor: "#4d3cff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  // Headings (Reused)
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#b8b9c8",
    fontSize: 15,
    marginBottom: 4,
    textAlign: 'center',
  },
  phoneNumberText: {
    color: "white",
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 40,
  },

  // --- OTP Inputs ---
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300, // Constraint max width for better centering on large screens
    marginVertical: 10,
  },
  otpInput: {
    width: 45, // Adjusted size for 6 boxes to fit
    height: 55,
    borderRadius: 8,
    backgroundColor: '#2B2F39', 
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    // Optional: Add a subtle border when focused
    // borderWidth: 1,
    // borderColor: 'transparent',
  },

  // Resend Text
  resendText: {
    color: "#6d4cff",
    fontSize: 15,
    fontWeight: '600',
  },
  disabledText: {
    color: "#80828c", // Muted color when disabled (timer is running)
  },

  // --- Security Warning Box ---
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    backgroundColor: "#2B2F39", // Darker background for the warning
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    // Orange/Amber border color
    borderColor: '#ff8b3d', 
    marginBottom: 30,
    marginTop: 10,
  },
  warningText: {
    color: "#cdd0df",
    fontSize: 13,
    marginLeft: 10,
    flexShrink: 1,
  },
  
  // Button (Reused)
  buttonWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: 'hidden',
  },
  button: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  disabledButton: {
    opacity: 0.6, // Mute the button when OTP is incomplete
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  
  // Footer (Reused)
  footer: {
    textAlign: "center",
    color: "#80828c", 
    fontSize: 13,
    marginTop: 25,
  },
  linkText: {
    color: "#6d4cff", 
    fontWeight: "bold",
  },
});