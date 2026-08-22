import React from "react";
import { Stack } from 'expo-router';

const isLoggedIn = false;

export default function RootLayout() {
  return (
    <Stack>
      {/* Prevent the user from accessing protected screens. If the user tries to access a protected 
      route, he is redirected to the anchor page */}
      <Stack.Protected guard = {isLoggedIn}>     
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack.Protected>
        
      {/* Redirect automatically to the login page */}
      <Stack.Screen name = "signIn"/>
    </Stack>
  );
}