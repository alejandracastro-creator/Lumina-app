import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A78BFA',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A103D',
          borderTopWidth: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="home" size={28} color={focused ? '#A78BFA' : '#C4B5FD'} />
          ),
        }}
      />
      <Tabs.Screen
        name="oracle"
        options={{
          title: 'Oráculos',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="sparkles" size={28} color={focused ? '#FDE68A' : '#C4B5FD'} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'Más',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="menu" size={28} color={focused ? '#A78BFA' : '#C4B5FD'} />
          ),
        }}
      />
      <Tabs.Screen
        name="ritual"
        options={{
          title: 'Rituales',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="journal" size={28} color={focused ? '#F472B6' : '#C4B5FD'} />
          ),
        }}
      />
      <Tabs.Screen
        name="process"
        options={{
          title: 'Procesos',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="flower" size={28} color={focused ? '#A7F3D0' : '#C4B5FD'} />
          ),
        }}
      />
    </Tabs>
  );
}

