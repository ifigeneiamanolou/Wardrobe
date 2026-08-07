import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import '../../global.css';
import {colors} from '../../constants/colors'; 

export default function RootLayout() {
  return (
    <Tabs screenOptions={{
        tabBarActiveTintColor: colors['pinkDark'],
        headerStyle: {
            backgroundColor: colors['pinkLight'],
        },
        headerShadowVisible: false,
        headerTintColor: colors['white'],
        tabBarStyle: {
            backgroundColor: colors['pinkLight'],
        },
        tabBarInactiveTintColor : colors['white']
    }}>

      <Tabs.Screen 
        name="index" 
        options={{ 
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />
        }} 
      />
      <Tabs.Screen 
        name="account" 
        options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />

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
        name="friends" 
        options={{ 
            title: 'Friends',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="address-book" color={color} />
        }} 
      />
      <Tabs.Screen 
        name="outfit" 
        options={{ 
            title: 'New Outfit',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="suitcase" color={color} />
        }} 
      />
    </Tabs>
  );
}