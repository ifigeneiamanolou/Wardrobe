import {View} from 'react-native';
import {Link, Stack} from 'expo-router';
import React from 'react';

export default function NotFoundPage() {
    <View>
        <Stack.Screen options={{ title: 'Oops! Not Found' }} />  
        <Link href = "/tabs">
            Not found !
        </Link>
    </View>
}