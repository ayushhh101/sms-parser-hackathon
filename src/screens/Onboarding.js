import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FeatureCard from "../components/FeatureCard";
import { useNavigation } from "@react-navigation/native";

export default function Onboarding() {

    const navigation = useNavigation();

    const handleGetStarted = () => {
    navigation.navigate('Login'); 
    };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContent}>
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 60, height: 60, }}
          />
        </View>

        <Text style={styles.title}>FinGuru</Text>
        <Text style={styles.subtitle}>Smart Finance for Gig Workers</Text>
      </View>

      {/* Feature Cards */}
      <View style={styles.cardRow}>
        <FeatureCard
          icon="trending-up"
          title="Track Earnings"
          subtitle="SMS, Voice & Cash logs"
          color="#3a7afe"
        />

        <FeatureCard
          icon="options"
          title="Smart Goals"
          subtitle="Auto-adjusting budgets"
          color="#b364ff"
        />
      </View>

      <View style={styles.cardRow}>
        <FeatureCard
          icon="sparkles-outline"
          title="AI Coach"
          subtitle="Personalized tips"
          color="#ff4fa5"
        />

        <FeatureCard
          icon="wallet-outline"
          title="Cash First"
          subtitle="Built for your reality"
          color="#ff8b3d"
        />
      </View>

      {/* Bullet Points */}
      {/* <View style={styles.infoBox}>
        <Text style={styles.bullet}>● Track income from Swiggy, Uber & cash</Text>
        <Text style={styles.bullet}>● Voice logging - just speak your expenses</Text>
        <Text style={styles.bullet}>● Festival & EMI stress predictions</Text>
      </View> */}

      {/* CTA Button */}
      <TouchableOpacity style={{ marginTop: 10 }} onPress={handleGetStarted}>
        <LinearGradient
          colors={["#6d4cff", "#9b4dff"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.footer}>Join 10,000+ gig workers managing their finances smarter</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#10131a",
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContent: {
    flexGrow: 1, 
    justifyContent: 'space-between', // Distributes space between sections
    paddingTop: 50, // Space from the top (mimics SafeArea + desired initial margin)
    paddingBottom: 30, // Space at the bottom
  },
  logoContainer: {
    backgroundColor: "#4d3cff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    color: "white",
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    color: "#b8b9c8",
    fontSize: 15,
    marginTop: 4,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  infoBox: {
    backgroundColor: "#1b1e27",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
  },
  bullet: {
    color: "#cdd0df",
    fontSize: 14,
    marginBottom: 6,
  },
  button: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    color: "#80828c",
    marginTop: 12,
    marginBottom: 40,
  },
});
