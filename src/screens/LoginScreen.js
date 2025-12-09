import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getApiUrl } from '../utils/apiConfig';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  
  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/auth/send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+91${phoneNumber}`
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("OTP sent:", data.otp); // Demo - OTP will be 1234
        Alert.alert(
          "OTP Sent!", 
          `OTP sent to +91${phoneNumber}\n\nDemo OTP: ${data.otp}`,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate('OTPVerification', { 
                phoneNumber: phoneNumber,
                demoOtp: data.otp 
              })
            }
          ]
        );
      } else {
        Alert.alert("Error", data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      Alert.alert("Error", "Network error. Please check if backend is running on port 3000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Phone Icon Container */}
      <View style={styles.iconContainer}>
        <Ionicons name="call-outline" size={32} color="white" />
      </View>

      {/* Title and Subtitle */}
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Enter your phone number to continue</Text>

      {/* Phone Number Input */}
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.inputContainer}>
        {/* Country Code */}
        <View style={styles.countryCodeBox}>
          <Text style={styles.countryCodeText}>+91</Text>
        </View>
        {/* Phone Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Enter 10 digit number"
          placeholderTextColor="#6c7385"
          keyboardType="numeric"
          maxLength={10}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      {/* OTP Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="lock-closed-outline" size={18} color="#7f93ff" />
        <Text style={styles.infoText}>
          We'll send you a one-time password (OTP) to verify your number
        </Text>
      </View>

      {/* Send OTP Button */}
      <TouchableOpacity 
        style={[styles.buttonWrapper, loading && styles.disabledButton]} 
        onPress={handleSendOTP}
        disabled={phoneNumber.length !== 10 || loading}
      >
        <LinearGradient
          colors={["#6d4cff", "#9b4dff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Send OTP"}
          </Text>
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

const styles = StyleSheet.create({
  // --- General Layout and Background ---
  container: {
    flex: 1,
    // Main dark background color from the image (a very deep purple/black)
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
    width: 68, // Slightly wider than previous
    height: 68,
    // The purple/blue background for the icon
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
    // Color for the lighter sub-text
    color: "#b8b9c8", 
    fontSize: 15,
    marginBottom: 40,
    textAlign: 'center',
  },

  // --- Input Section ---
  label: {
    width: "100%",
    color: "#b8b9c8", // Lighter than previous for better contrast with label
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    height: 55,
    // Darker, charcoal-like color for the input area
    backgroundColor: "#2B2F39", 
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  countryCodeBox: {
    justifyContent: "center",
    alignItems: "center",
    // Slightly lighter dark grey/blue for +91 background
    backgroundColor: "#22252e", 
    paddingHorizontal: 15,
    height: "100%",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  countryCodeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 15,
    color: "white",
    fontSize: 16,
  },

  // --- OTP Info Box ---
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    // Background is the main dark background color, matching the app's overall theme
    backgroundColor: "#1f2843ff", 
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    // Distinct bright blue border color
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
  },
  button: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  // --- Footer ---
  footer: {
    textAlign: "center",
    // Muted grey color for the footer text
    color: "#80828c", 
    fontSize: 13,
    marginTop: 25,
  },
  linkText: {
    // Matching the gradient start color for the link
    color: "#6d4cff", 
    fontWeight: "bold",
  },
});