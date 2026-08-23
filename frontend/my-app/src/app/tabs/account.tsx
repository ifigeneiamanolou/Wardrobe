import { Button, View} from 'react-native';
import React from 'react';
import { useSession } from '@/src/ctx';

export default function Account() {
    const session = useSession();
    return(
        <View>
            <Button 
                title = "press" 
                onPress={session?.signOut}/>
        </View>
    );
}