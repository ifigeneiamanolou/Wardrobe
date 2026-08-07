import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="account" options={{ title: 'Account' }} />
      <Stack.Screen name="add" options={{ title: 'Add' }} />
      <Stack.Screen name="friends" options={{ title: 'Friends' }} />
      <Stack.Screen name="outfit" options={{ title: 'Outfit' }} />
    </Stack>
  );
}