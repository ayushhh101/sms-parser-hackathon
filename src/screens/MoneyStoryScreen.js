import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "../utils/apiConfig";

// APP-WIDE COLORS (same as in App.js)
const C = {
  bg: "#0f0f1a",
  card: "#1a1a2e",
  border: "#2d2d44",
  purple: "#6c5ce7",
  green: "#00b894",
  red: "#ff7675",
  yellow: "#fdcb6e",
  white: "#fff",
  gray: "#aaa",
};

// Convert month number → Full month name
const getMonthName = (monthNum) => {
  const date = new Date();
  date.setMonth(monthNum - 1);
  return date.toLocaleString("en-US", { month: "long" });
};

// ------------------------------
// Comparison Bar Component
// ------------------------------
const ComparisonBar = ({ label, current, previous, barColor }) => {
  const max = Math.max(current, previous) * 1.2 || 1;
  const currentWidth = (current / max) * 100;
  const prevWidth = (previous / max) * 100;

  return (
    <View style={{ marginBottom: 18 }}>
      <View className="flex-row justify-between mb-1">
        <Text style={{ color: C.gray, fontSize: 13 }}>{label}</Text>

        <View className="flex-row items-center">
          <Text style={{ color: C.gray, fontSize: 12 }}>₹{previous}</Text>
          <MaterialCommunityIcons name="arrow-right-thin" size={16} color={C.gray} />
          <Text style={{ color: barColor, fontWeight: "700" }}>₹{current}</Text>
        </View>
      </View>

      <View style={{ height: 16, justifyContent: "center", position: "relative" }}>
        <View
          style={{
            height: 4,
            backgroundColor: "#2d2d44",
            borderRadius: 8,
            width: `${prevWidth}%`,
            position: "absolute",
            top: 6,
          }}
        />
        <View
          style={{
            height: 4,
            borderRadius: 8,
            width: `${currentWidth}%`,
            backgroundColor: barColor,
            position: "absolute",
            bottom: 6,
            shadowOpacity: 0.3,
          }}
        />
      </View>
    </View>
  );
};

export default function MoneyStoryScreen() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, []);

  const loadStory = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userData");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || "usr_rahul_001";

      const response = await fetch(getApiUrl(`/story/${userId}`));
      const json = await response.json();

      if (json.success) setStory(json.data);
    } catch (err) {
      console.log("Story fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: C.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={C.green} />
        <Text style={{ color: C.gray, marginTop: 8 }}>Loading your story...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* -------- CLEAN HEADER (NO BACK BUTTON, NO SHARE, NO SAVE) -------- */}
      <View
        style={{
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              color: C.white,
              fontSize: 24,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            Your Money Story
          </Text>

          {/* Month Name + Year */}
          <Text style={{ color: C.gray, fontSize: 14, textAlign: "center" }}>
            {story?.month
              ? `${getMonthName(story.month)} ${new Date(
                  story?.timestamp
                ).getFullYear()}`
              : ""}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* -------- SUMMARY CARD -------- */}
        <View
          style={{
            backgroundColor: "#132e20",
            borderColor: "#1abc9c55",
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={20}
              color={C.green}
            />
            <Text
              style={{
                color: C.green,
                marginLeft: 6,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {story?.monthly_summ_head}
            </Text>
          </View>

          <Text
            style={{
              color: C.white,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 6,
            }}
          >
            Hey User! 👋
          </Text>

          <Text style={{ color: C.gray, lineHeight: 20 }}>
            {story?.monthly_summ_content}
          </Text>
        </View>

        <Text
          style={{ color: C.white, fontSize: 16, fontWeight: "700", marginBottom: 12 }}
        >
          Key Highlights
        </Text>

        {/* -------- EARNINGS CARD -------- */}
        <View
          style={{
            backgroundColor: C.card,
            borderColor: C.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 18,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#00b89433",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="trending-up"
                size={24}
                color={C.green}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ color: C.white, fontSize: 16, fontWeight: "700" }}
              >
                {story?.earning_head}
              </Text>

              <Text style={{ color: C.gray, fontSize: 13 }}>
                You made ₹
                {story?.visual_metrics?.earnings?.current.toLocaleString()}
              </Text>
            </View>
          </View>

          <Text style={{ color: C.gray, marginTop: 10, lineHeight: 18 }}>
            {story?.earning_content}
          </Text>

          <View
            style={{
              marginTop: 10,
              backgroundColor: "#00b89422",
              padding: 6,
              borderRadius: 6,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: C.green, fontWeight: "700", fontSize: 12 }}>
              +
              {story?.visual_metrics?.earnings?.growth?.toLocaleString()} vs
              last month
            </Text>
          </View>
        </View>

        {/* -------- EXPENSE SPIKE CARD -------- */}
        <View
          style={{
            backgroundColor: C.card,
            borderColor: C.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            marginBottom: 18,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#ff767533",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="trending-down"
                size={28}
                color={C.red}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ color: C.white, fontSize: 16, fontWeight: "700" }}
              >
                {story?.spike_header}
              </Text>
              <Text style={{ color: C.gray, fontSize: 13 }}>
                Highest category: ₹{story?.visual_metrics?.topExpense?.amount}
              </Text>
            </View>
          </View>

          <Text style={{ color: C.gray, marginTop: 10, lineHeight: 18 }}>
            {story?.spike_content}
          </Text>

          <View
            style={{
              marginTop: 10,
              backgroundColor: "#ff767522",
              padding: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: C.red, fontWeight: "700", fontSize: 12 }}>
              {story?.visual_metrics?.topExpense?.percentage}
            </Text>
          </View>
        </View>

        {/* -------- SMART INSIGHT -------- */}
        <LinearGradient
          colors={["#4C1D95", "#2E1065"]}
          style={{
            padding: 16,
            borderRadius: 16,
            marginBottom: 18,
            borderWidth: 1,
            borderColor: "#4C1D95",
          }}
        >
          <Text
            style={{
              color: "#c4b5fd",
              fontSize: 14,
              fontWeight: "700",
              marginBottom: 4,
            }}
          >
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={16}
            />{" "}
            {story?.smart_header}
          </Text>

          <Text style={{ color: C.white, fontStyle: "italic", lineHeight: 20 }}>
            "{story?.smart_content}"
          </Text>
        </LinearGradient>

        {/* -------- MONTH VS MONTH -------- */}
        <View
          style={{
            backgroundColor: C.card,
            borderColor: C.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: C.white,
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 14,
            }}
          >
            Month vs Month
          </Text>

          <ComparisonBar
            label="Earnings"
            current={story?.visual_metrics?.earnings?.current}
            previous={story?.visual_metrics?.earnings?.previous}
            barColor={C.green}
          />

          <ComparisonBar
            label="Spending"
            current={story?.visual_metrics?.spending?.current}
            previous={story?.visual_metrics?.spending?.previous}
            barColor={C.yellow}
          />

          <ComparisonBar
            label="Savings"
            current={story?.visual_metrics?.savings?.current}
            previous={story?.visual_metrics?.savings?.previous}
            barColor={C.purple}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
