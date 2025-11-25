import React from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#0f0f1a', card: '#1a1a2e', border: '#2d2d44',
  purple: '#6c5ce7', green: '#00b894', red: '#ff7675',
  yellow: '#fdcb6e', white: '#fff', gray: '#888',
};

const TestCard = ({ title, description, icon, onPress }) => (
  <TouchableOpacity style={s.testCard} onPress={onPress}>
    <Text style={s.cardIcon}>{icon}</Text>
    <Text style={s.cardTitle}>{title}</Text>
    <Text style={s.cardDesc}>{description}</Text>
  </TouchableOpacity>
);

export default function TestScreen({ navigation }) {
  const testItems = [
    {
      title: "SMS Parsing Engine",
      description: "Test SMS parsing functionality with various message formats",
      icon: "📱",
      action: () => console.log('SMS Parsing test triggered')
    },
    {
      title: "OTP Detection",
      description: "Test OTP extraction from different banking and service messages",
      icon: "🔢",
      action: () => console.log('OTP Detection test triggered')
    },
    {
      title: "Transaction Categories",
      description: "Test merchant categorization and transaction classification",
      icon: "🏷️",
      action: () => console.log('Transaction Categories test triggered')
    },
    {
      title: "Demo Data Generator",
      description: "Test random demo SMS generation for different scenarios",
      icon: "🎲",
      action: () => console.log('Demo Data Generator test triggered')
    },
    {
      title: "Navigation Test",
      description: "Test navigation between different screens",
      icon: "🧭",
      action: () => navigation.navigate('Dashboard')
    }
  ];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.logo}>🧪 Test Page</Text>
        <Text style={s.subtitle}>Test features and navigation</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Feature Tests</Text>
          <Text style={s.sectionDesc}>
            Use these test cards to verify different parts of the SMS parser app
          </Text>
        </View>

        {testItems.map((item, index) => (
          <TestCard
            key={index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onPress={item.action}
          />
        ))}

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>🚀 For Teammates</Text>
          <Text style={s.infoText}>
            This test page helps you verify that navigation is working correctly. 
            You can add new test cases here and create new screens by adding them 
            to the navigation structure.
          </Text>
        </View>

        <View style={s.navTestBox}>
          <Text style={s.navTestTitle}>Navigation Test</Text>
          <TouchableOpacity 
            style={s.navBtn} 
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={s.navBtnText}>← Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={s.teamBox}>
          <Text style={s.teamTitle}>👥 Team Development</Text>
          <Text style={s.teamText}>
            To add new screens:
            {'\n'}1. Create new screen file in src/screens/
            {'\n'}2. Add to navigation in App.js
            {'\n'}3. Test navigation with these buttons
            {'\n'}4. Commit and share with team
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: C.bg 
  },
  header: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderColor: C.border,
    alignItems: 'center'
  },
  logo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: C.white 
  },
  subtitle: { 
    fontSize: 14, 
    color: C.gray, 
    marginTop: 4 
  },
  content: { 
    padding: 16 
  },
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: C.white, 
    marginBottom: 8 
  },
  sectionDesc: { 
    fontSize: 14, 
    color: C.gray, 
    lineHeight: 20 
  },
  testCard: { 
    backgroundColor: C.card, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    alignItems: 'center'
  },
  cardIcon: { 
    fontSize: 32, 
    marginBottom: 8 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: C.white, 
    marginBottom: 4,
    textAlign: 'center'
  },
  cardDesc: { 
    fontSize: 12, 
    color: C.gray, 
    textAlign: 'center',
    lineHeight: 16 
  },
  infoBox: { 
    backgroundColor: C.purple + '20', 
    borderRadius: 12, 
    padding: 16, 
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: C.purple
  },
  infoTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: C.white, 
    marginBottom: 8 
  },
  infoText: { 
    fontSize: 13, 
    color: C.gray, 
    lineHeight: 18 
  },
  navTestBox: { 
    backgroundColor: C.green + '20', 
    borderRadius: 12, 
    padding: 16, 
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: C.green,
    alignItems: 'center'
  },
  navTestTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: C.white, 
    marginBottom: 12 
  },
  navBtn: { 
    backgroundColor: C.green, 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  navBtnText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: C.white 
  },
  teamBox: { 
    backgroundColor: C.yellow + '20', 
    borderRadius: 12, 
    padding: 16, 
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: C.yellow
  },
  teamTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: C.white, 
    marginBottom: 8 
  },
  teamText: { 
    fontSize: 13, 
    color: C.gray, 
    lineHeight: 18 
  },
});