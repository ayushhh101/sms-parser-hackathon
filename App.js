import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './src/screens/DashboardScreen';
import TestScreen from './src/screens/TestScreen';

const Tab = createBottomTabNavigator();

// Colors for consistent theming
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

export default function App() {
  return (
    <NavigationContainer>
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
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>💰</Text>
            ),
            tabBarLabel: 'Dashboard'
          }}
        />
        <Tab.Screen 
          name="Test" 
          component={TestScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🧪</Text>
            ),
            tabBarLabel: 'Test'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}