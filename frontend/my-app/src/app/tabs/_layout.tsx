import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import colors from '../../constants/colors'; 

export default function RootLayout() {
  return (
    <Tabs screenOptions={{
        tabBarActiveTintColor: colors['Dusty rose'],
        headerStyle: {
            backgroundColor: colors['Rose'],
        },
        headerShadowVisible: false,
        headerTintColor: colors['White'],
        tabBarStyle: {
            backgroundColor: colors['Rose'],
        },
        tabBarInactiveTintColor : colors['White']
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
            title: 'Library',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />
        }} 
      />

      <Tabs.Screen 
        name="add" 
        options={{ 
            title: 'Add Item',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="plus" color={color} />
        }} 
      />

      <Tabs.Screen 
        name="feed" 
        options={{ 
            title: 'Feed',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="caret-down" color={color} />
        }} 
      />
      
      <Tabs.Screen 
        name="outfit" 
        options={{ 
            title: 'New Outfit',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="suitcase" color={color} />
        }} 
      />

      <Tabs.Screen 
        name="account" 
        options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />

        }} 
      />
    </Tabs>
  );
}