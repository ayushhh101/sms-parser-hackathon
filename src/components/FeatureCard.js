import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function FeatureCard({ icon, title, subtitle, color }) {
  return (
    <LinearGradient
      colors={["#2b2f39", "#1f2230"]}
      style={styles.card}
    >
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    color: "#b7b9c4",
    fontSize: 13,
    marginTop: 4,
  },
});
