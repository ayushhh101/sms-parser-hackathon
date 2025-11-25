import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// --- Card Styles for internal use in PermissionCard ---
const cardStyles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: "#2B2F39",
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  // --- New Text Wrapper ---
  textWrapper: {
    flex: 1, // Allows text to take available space
    paddingRight: 10, // Ensure space before the toggle
  },
  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cardToggle: {
    // Empty but kept for reference
  },
  cardSubtitle: {
    color: "#cdd0df",
    fontSize: 13,
    lineHeight: 18,
    // NO marginLeft needed here, alignment is handled by the flex layout below
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    // Align this row to the left of the text wrapper
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00b894',
    marginRight: 6,
  },
  cardInfoText: {
    color: '#00b894',
    fontSize: 12,
    fontWeight: '500',
  },
});


// --- Custom Permission Card Component ---
function PermissionCard({ iconName, iconColor, title, subtitle, infoText, value, onToggle }) {
  return (
    <View style={cardStyles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Icon Container (Fixed Width) */}
        <View style={[cardStyles.cardIconBox, { backgroundColor: iconColor }]}>
          <Ionicons name={iconName} size={22} color="white" />
        </View>

        {/* Text Column and Toggle */}
        <View style={{ flex: 1 }}>
            {/* Title and Toggle Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={cardStyles.cardTitle}>{title}</Text>
                <Switch
                    trackColor={{ false: "#555b66", true: "#6d4cff" }}
                    thumbColor={value ? "white" : "#d8d9e2"}
                    onValueChange={onToggle}
                    value={value}
                    style={cardStyles.cardToggle}
                />
            </View>
            
            {/* Subtitle / Description */}
            <Text style={cardStyles.cardSubtitle}>{subtitle}</Text>
            
            {/* Info Bullet Point */}
            <View style={cardStyles.cardInfoRow}>
                <View style={cardStyles.infoDot} />
                <Text style={cardStyles.cardInfoText}>{infoText}</Text>
            </View>
        </View>
      </View>
    </View>
  );
}

// --- Main Screen Component ---

export default function PermissionsScreen() {
  const navigation = useNavigation();

  // State for permission toggles
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const handleContinue = () => {
    console.log("Permissions Granted:", { smsEnabled, notificationsEnabled, locationEnabled });
    // Navigate to the next step (Step 3) in the Onboarding flow
    navigation.navigate('Step3Screen'); 
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress Bar & Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.stepText}>Step 2 of 6</Text>
        <Text style={styles.stepText}>33% Complete</Text>
      </View>
      <View style={styles.progressBarBackground}>
        {/* Progress (33%) */}
        <View style={[styles.progressBarFill, { width: '33%' }]} />
      </View>

      {/* Shield Icon Container */}
      <View style={styles.iconContainer}>
        <Ionicons name="shield-outline" size={28} color="white" />
      </View>

      {/* Title and Subtitle */}
      <Text style={styles.title}>Enable Permissions</Text>
      <Text style={styles.subtitle}>Help us provide you the best experience</Text>

      {/* Permission Cards */}
      <View style={styles.permissionSection}>
        <PermissionCard
          iconName="chatbubble-outline"
          iconColor="#3a7afe"
          title="SMS Access"
          subtitle="Auto-capture earnings from Swiggy, Zomato, Uber payouts"
          infoText="No manual entry needed"
          value={smsEnabled}
          onToggle={setSmsEnabled}
        />
        <PermissionCard
          iconName="notifications-outline"
          iconColor="#ff4fa5"
          title="Notifications"
          subtitle="Get spending alerts, savings tips, and goal reminders"
          infoText="Stay on track with your finances"
          value={notificationsEnabled}
          onToggle={setNotificationsEnabled}
        />
        <PermissionCard
          iconName="location-outline"
          iconColor="#ff8b3d"
          title="Location Access"
          subtitle="Get shift timing suggestions and area-based earnings insights"
          infoText="Optimize your work schedule"
          value={locationEnabled}
          onToggle={setLocationEnabled}
        />
      </View>

      {/* Privacy Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="lock-closed-outline" size={16} color="#9b4dff" style={{ marginTop: 2 }} />
        <Text style={styles.infoText}>
          <Text style={{fontWeight: '700'}}>Your privacy matters.</Text> You can change these permissions anytime from settings.
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
  );
}

// --- Stylesheet (Aggressively Optimized for Space and Main Layout) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B1E27",
    paddingHorizontal: 20,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  // --- Progress Bar ---
  progressHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
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
    marginBottom: 10,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#6d4cff',
    borderRadius: 3,
  },
  // --- Icon & Title ---
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "#4d3cff",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "700",
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: "#b8b9c8",
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  // --- Permission Cards Section ---
  permissionSection: {
    width: '100%',
    marginBottom: 10,
  },
  // --- Privacy Info Box ---
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    backgroundColor: "#443425",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff8b3d',
    marginBottom: 15,
  },
  infoText: {
    color: "#f5e8da",
    fontSize: 12,
    marginLeft: 8,
    flexShrink: 1,
  },
  // --- Buttons (Reduced overall height to save space) ---
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    width: '35%',
    height: 44,
    backgroundColor: '#2B2F39',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#cdd0df',
    fontSize: 15,
    fontWeight: '600',
  },
  continueButtonWrapper: {
    width: '60%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  continueButton: {
    width: '100%',
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  continueButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});