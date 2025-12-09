import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from '../utils/apiConfig';

const OTP_LENGTH = 4; // Changed to 4 digits

export default function OTPVerificationScreen({ route }) {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigation = useNavigation();
  
  // Get phone number from route params
  const { phoneNumber, demoOtp } = route.params || {};
  const displayPhone = phoneNumber || "+91 XXXXXXXXXX";

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

  const verifyOtp = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== OTP_LENGTH) {
      Alert.alert("Error", `Please enter a ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/auth/verify-otp'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: `+91${phoneNumber}`,
          otp: fullOtp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in AsyncStorage
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        
        Alert.alert("Success", "Login successful!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Invalid OTP. Please try again.");
        // Clear OTP on error
        setOtp(new Array(OTP_LENGTH).fill(""));
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setLoading(false);
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

  const resendOtp = async () => {
    setResendLoading(true);
    try {
      const response = await fetch(getApiUrl('/auth/send-otp'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: `+91${phoneNumber}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", `OTP sent successfully!\n\nDemo OTP: ${data.otp}`);
        setTimer(30); // Reset timer
        setOtp(new Array(OTP_LENGTH).fill("")); // Clear OTP inputs
        inputRefs.current[0].focus(); // Focus the first input
      } else {
        Alert.alert("Error", data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setResendLoading(false);
    }
  };
  
  const isOtpComplete = otp.every(digit => digit !== "");

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Shield Icon Container */}
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark-outline" size={32} color="white" />
      </View>

      {/* Title and Subtitle */}
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the {OTP_LENGTH}-digit code sent to
      </Text>
      <Text style={styles.phoneNumber}>{displayPhone}</Text>

      {/* Demo OTP Display */}
      {demoOtp && (
        <View style={styles.demoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#7f93ff" />
          <Text style={styles.demoText}>
            Demo OTP: <Text style={styles.demoOtp}>{demoOtp}</Text>
          </Text>
        </View>
      )}

      {/* OTP Label */}
      <Text style={styles.label}>Enter OTP</Text>

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
            placeholder="0"
            placeholderTextColor="#6c7385"
            caretHidden={true} // Hides the cursor, standard for OTP boxes
          />
        ))}
      </View>

      {/* Resend Timer/Button */}
      <TouchableOpacity 
        onPress={resendOtp} 
        disabled={timer > 0 || resendLoading}
        style={styles.resendButtonContainer}
      >
        <Text style={[styles.resendText, (timer > 0 || resendLoading) && styles.disabledText]}>
          {resendLoading 
            ? "Sending..." 
            : timer > 0 
              ? `Resend OTP in ${timer}s` 
              : "Resend OTP"
          }
        </Text>
      </TouchableOpacity>
      
      {/* Security Warning Box */}
      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark-outline" size={18} color="#7f93ff" />
        <Text style={styles.infoText}>
          <Text style={{fontWeight: '700'}}>Never share your OTP with anyone.</Text> We will never ask for it.
        </Text>
      </View>

      {/* Verify Button */}
      <TouchableOpacity 
        style={[styles.buttonWrapper, (!isOtpComplete || loading) && styles.disabledButton]} 
        onPress={verifyOtp}
        disabled={!isOtpComplete || loading}
      >
        <LinearGradient
          colors={["#6d4cff", "#9b4dff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Continue</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back to Login</Text>
      </TouchableOpacity>

      {/* Footer Text */}
      <Text style={styles.footer}>
        By continuing, you agree to our{" "}
        <Text style={styles.linkText}>Terms & Privacy Policy</Text>
      </Text>
    </ScrollView>
  );
}

  // Styles matching LoginScreen design
const styles = StyleSheet.create({
  // --- General Layout and Background ---
  container: {
    flex: 1,
    backgroundColor: "#1B1E27", 
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 140, // Space from the top
    paddingBottom: 30,
  },

  // --- Icon Container ---
  iconContainer: {
    width: 68,
    height: 68,
    backgroundColor: "#4d3cff", 
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  // --- Headings ---
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#b8b9c8", 
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 18,
    color: "#6d4cff",
    fontWeight: "600",
    marginBottom: 20,
  },

  // --- Demo OTP Box ---
  demoBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#1f2843ff", 
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a7afe', 
    marginBottom: 20,
  },
  demoText: {
    color: "#cdd0df",
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  demoOtp: {
    color: "#6d4cff",
    fontWeight: "700",
    fontSize: 16,
  },

  // --- Input Section ---
  label: {
    width: "100%",
    color: "#b8b9c8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "left",
  },

  // --- OTP Inputs ---
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
    marginBottom: 20,
  },
  otpInput: {
    width: 60,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#2B2F39', 
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 5,
  },

  // --- Resend Button ---
  resendButtonContainer: {
    marginBottom: 20,
  },
  resendText: {
    color: "#6d4cff",
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    color: "#80828c",
  },

  // --- Info Box ---
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    backgroundColor: "#1f2843ff", 
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a7afe', 
    marginBottom: 30,
  },
  infoText: {
    color: "#cdd0df",
    fontSize: 11,
    marginLeft: 10,
    flexShrink: 1,
  },
  
  // --- Button ---
  buttonWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  button: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  // --- Back Button ---
  backButton: {
    alignItems: "center",
    marginBottom: 15,
  },
  backText: {
    color: "#b8b9c8",
    fontSize: 16,
  },
  
  // --- Footer ---
  footer: {
    textAlign: "center",
    color: "#80828c", 
    fontSize: 13,
    marginTop: 10,
  },
  linkText: {
    color: "#6d4cff", 
    fontWeight: "bold",
  },
});