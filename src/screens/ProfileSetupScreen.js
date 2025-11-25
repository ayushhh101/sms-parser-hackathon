import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// --- Language Options ---
const LANGUAGE_OPTIONS = [
  "English",
  "Hindi (हिंदी)",
  "Marathi (मराठी)",
  "Bengali (বাংলা)",
  "Tamil (தமிழ்)",
  "Telugu (తెలుగు)",
];

// --- Custom Components ---

const LabeledInput = ({ label, placeholder, iconName, value, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label} *</Text>
    <View style={styles.inputContainer}>
      <Ionicons name={iconName} size={20} color="#6c7385" style={styles.inputIcon} />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#6c7385"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

const SelectLanguage = ({ label, selectedLanguage, onPress }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label} *</Text>
    <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={onPress} 
        activeOpacity={0.7}
    >
      <Ionicons name="globe-outline" size={20} color="#6c7385" style={styles.inputIcon} />
      <Text style={[styles.selectText, selectedLanguage ? styles.selectTextSelected : styles.selectTextPlaceholder]}>
        {selectedLanguage || "Tap to select your language"}
      </Text>
      <Ionicons name="chevron-down-outline" size={16} color="#6c7385" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  </View>
);


// --- Main Screen Component ---

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState(null); 
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectLanguage = (language) => {
    // Set the state and close the modal immediately
    setPreferredLanguage(language);
    setIsModalVisible(false); 
    console.log(`Language selected and stored: ${language}`);
  };

  const handleOpenLanguageSelector = () => {
    setIsModalVisible(true);
  };

  const handleContinue = () => {
    if (fullName && age && city && preferredLanguage) {
      console.log("Profile Data:", { fullName, age, city, preferredLanguage });
      // Navigate to the next step (Step 2)
      navigation.navigate('Step2Screen'); 
    } else {
      console.log("Please fill all required fields.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Bar & Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>Step 1 of 6</Text>
          <Text style={styles.stepText}>17% Complete</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '17%' }]} />
        </View>

        {/* User Icon Container & Titles */}
        <View style={styles.iconContainer}>
          <Ionicons name="person-outline" size={28} color="white" />
        </View>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Help us personalize your experience</Text>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <LabeledInput
            label="Full Name"
            placeholder="Enter your full name"
            iconName="person-outline"
            value={fullName}
            onChangeText={setFullName}
          />
          <LabeledInput
            label="Age"
            placeholder="Enter your age"
            iconName="calendar-outline"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          <LabeledInput
            label="City"
            placeholder="Enter your city"
            iconName="location-outline"
            value={city}
            onChangeText={setCity}
          />
          <SelectLanguage 
            label="Preferred Language" 
            selectedLanguage={preferredLanguage}
            onPress={handleOpenLanguageSelector}
          />
        </View>

        {/* Security Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="bulb-outline" size={18} color="#fdcb6e" style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            Your information is secure and used only to personalize your financial coaching experience.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButtonWrapper} onPress={handleContinue}>
            <LinearGradient
              colors={["#6d4cff", "#9b4dff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🌐 LANGUAGE SELECTION MODAL 🌐 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalTitle}>Select a Language</Text>
            
            <ScrollView style={{ maxHeight: 300, width: '100%' }}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[modalStyles.languageOption, preferredLanguage === lang && modalStyles.selectedOption]}
                  onPress={() => handleSelectLanguage(lang)}
                >
                  <Text style={modalStyles.optionText}>{lang}</Text>
                  {preferredLanguage === lang && (
                      <Ionicons name="checkmark-circle" size={20} color="#6d4cff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={modalStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ------------------------------------
//          STYLESHEETS
// ------------------------------------

// --- MODAL Stylesheet ---

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        width: '85%',
        backgroundColor: '#1B1E27',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
        marginBottom: 15,
    },
    languageOption: {
        width: '100%',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#2B2F39',
    },
    selectedOption: {
        borderWidth: 2,
        borderColor: '#6d4cff',
    },
    optionText: {
        fontSize: 16,
        color: 'white',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
    },
    closeButtonText: {
        color: '#b8b9c8',
        fontSize: 16,
    }
});


// --- Base Screen Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B1E27",
    paddingHorizontal: 25,
  },
  contentContainer: {
    paddingTop: 15,
    paddingBottom: 40,
    alignItems: 'center',
  },
  progressHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  stepText: {
    color: '#80828c',
    fontSize: 13,
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#2B2F39',
    borderRadius: 3,
    marginBottom: 20,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#6d4cff',
    borderRadius: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#4d3cff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "700",
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: "#b8b9c8",
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    marginBottom: 10,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    width: "100%",
    color: "#cdd0df",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 48,
    backgroundColor: "#2B2F39", 
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    height: '100%',
  },
  selectText: {
    flex: 1,
    fontSize: 16,
  },
  selectTextSelected: {
    color: 'white', 
  },
  selectTextPlaceholder: {
    color: '#6c7385', 
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    backgroundColor: "#2B2F39", 
    padding: 12,
    borderRadius: 10, 
    borderLeftWidth: 4, 
    borderColor: '#fdcb6e',
    marginBottom: 20,
  },
  infoText: {
    color: "#cdd0df",
    fontSize: 12,
    marginLeft: 10,
    flexShrink: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    width: '35%',
    height: 48,
    backgroundColor: '#2B2F39',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#cdd0df',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonWrapper: {
    width: '60%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  continueButton: {
    width: '100%',
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});