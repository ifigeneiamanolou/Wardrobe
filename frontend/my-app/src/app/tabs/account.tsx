import { Button, View} from 'react-native';
import React from 'react';
import {logOut} from '@/src/apis/auth';
import { useSession } from '@/src/ctx';

export default function Account() {
    const session = useSession();
    return(
        <View>
            <Button 
                title = "press" 
                onPress={() => logOut({session : session})}/>
        </View>
    );
}