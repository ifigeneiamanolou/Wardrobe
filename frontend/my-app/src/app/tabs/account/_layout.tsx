import React from "react";
import { Stack } from "expo-router";
import colors from "@/src/constants/colors";

export default function AccountLayout(){
    return(
        <Stack screenOptions={{
            headerStyle : {backgroundColor : colors['Dusty rose']},
            headerShadowVisible : false,
            headerTintColor : colors['White']
        }}>
            <Stack.Screen name = "index" options = {{headerShown : false}}/>
            <Stack.Screen name = "edit"  options = {{headerShown : false}}/>
            <Stack.Screen name = "friends"  options = {{headerShown : false}}/>
            <Stack.Screen name = "addFriend"  options = {{headerShown : false}}/>
            <Stack.Screen name = "notifications"  options = {{headerShown : false}}/>
            <Stack.Screen name = "privacy"   options = {{headerShown : false}}/>
            <Stack.Screen name = "settings"  options = {{headerShown : false}}/>
        </Stack>
    );
}