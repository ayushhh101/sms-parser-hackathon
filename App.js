import React from 'react';
import "./global.css";
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GoalsScreen from './src/screens/GoalsScreen';
import ChatScreen from './src/screens/ChatScreen';
import CaptureScreen from './src/screens/CaptureScreen';
import RiskDetectorScreen from './src/screens/RiskDetectorScreen';

import DashboardScreen from './src/screens/DashboardScreen';
import TestScreen from './src/screens/TestScreen';
import Onboarding from './src/screens/Onboarding';
import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import SMSParserScreen from './src/screens/SMSParserScreen';
import MoneyStoryScreen from './src/screens/MoneyStoryScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const C = {
  bg: '#0f0f1a', 
  card: '#1a1a2e', 
  border: '#2d2d44',
  purple: '#6c5ce7', 
  green: '#00b894', 
  red: '#ff7675',
  yellow: '#fdcb6e', 
  white: '#fff', 
  gray: '#888',
};



function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.card,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: C.purple,
        tabBarInactiveTintColor: C.gray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💰</Text>
          ),
          tabBarLabel: 'Dashboard'
        }}
      /> */}
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Dashboard'
        }}
      />

      <Tab.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bullseye-arrow" size={size} color={color} />
          ),
          tabBarLabel: 'Goals'
        }}
      />

      <Tab.Screen 
        name="Coach" 
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Coach'
        }}
      />

      <Tab.Screen 
        name="RiskDetector" 
        component={RiskDetectorScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-alert-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Risk'
        }}
      />

      <Tab.Screen 
        name="Capture" 
        component={CaptureScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mic-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Capture'
        }}
      />

      <Tab.Screen 
        name="Story" 
        component={MoneyStoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Story'
        }}
      />

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account-circle" color={color} size={size} />
            ),
            tabBarLabel: "Profile"
        }}
    />

      
      
      
      
    </Tab.Navigator>
  );
}

// --- 2. Main App Component (Stack Navigator) ---
export default function App() {
  // Logic here would typically check if the user is logged in
  // For now, we set the initial route to 'Onboarding'

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Onboarding" // Start here
        screenOptions={{ headerShown: false }} // No header on any screen
      >
        {/* Screens WITHOUT Tabs (The Authentication Flow) */}
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="SMSParser" component={SMSParserScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />

        {/* The screen WITH Tabs (The Main App) */}
        {/* We call the Tab Navigator component here. When the user navigates here, 
            the tabs will appear below the HomeTabs content. */}
        <Stack.Screen name="Home" component={HomeTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



// export default function App() {
//   return (
//     <NavigationContainer>
//       <Tab.Navigator
//         screenOptions={{
//           headerShown: false,
//           tabBarStyle: {
//             backgroundColor: C.card,
//             borderTopColor: C.border,
//             borderTopWidth: 1,
//             height: 60,
//             paddingBottom: 8,
//           },
//           tabBarActiveTintColor: C.purple,
//           tabBarInactiveTintColor: C.gray,
//           tabBarLabelStyle: {
//             fontSize: 12,
//             fontWeight: '600',
//           },
//         }}
//       >
//         <Tab.Screen 
//           name="Dashboard" 
//           component={DashboardScreen}
//           options={{
//             tabBarIcon: ({ color, size }) => (
//               <Text style={{ fontSize: size, color }}>💰</Text>
//             ),
//             tabBarLabel: 'Dashboard'
//           }}
//         />
//         <Tab.Screen 
//           name="Test" 
//           component={TestScreen}
//           options={{
//             tabBarIcon: ({ color, size }) => (
//               <Text style={{ fontSize: size, color }}>🧪</Text>
//             ),
//             tabBarLabel: 'Test'
//           }}
//         />
//         <Tab.Screen 
//           name="Onboarding" 
//           component={Onboarding}
//           options={{
//             tabBarIcon: ({ color, size }) => (
//               <Text style={{ fontSize: size, color }}>🧪</Text>
//             ),
//             tabBarLabel: 'Onboarding'
//           }}
//         />
//         <Tab.Screen 
//           name="Login" 
//           component={LoginScreen}
//           options={{
//             tabBarIcon: ({ color, size }) => (
//               <Text style={{ fontSize: size, color }}>🧪</Text>
//             ),
//             tabBarLabel: 'Login'
//           }}
//         />
//         <Tab.Screen 
//           name="OTP" 
//           component={OTPVerificationScreen}
//           options={{
//             tabBarIcon: ({ color, size }) => (
//               <Text style={{ fontSize: size, color }}>🧪</Text>
//             ),
//             tabBarLabel: 'OTP'
//           }}
//         />
//       </Tab.Navigator>
//     </NavigationContainer>
//   );
// }

// --- 1. Tab Navigator Component (Screens with Tabs) ---
