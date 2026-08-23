import React from "react";
import { Stack } from 'expo-router';
import { SessionProvider } from "../ctx";

const isLoggedIn = false;

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Prevent the user from accessing protected screens. If the user tries to access a protected 
        route, he is redirected to the anchor page */}   
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
          
        {/* Redirect automatically to the login page */}
        <Stack.Screen name = "signIn"/>
      </Stack>
    </SessionProvider>
  );
}