import { Button, View} from 'react-native';
import React from 'react';
import { useSession } from '@/src/ctx';
import constants from '@/src/constants/app';

export default function Account() {
    const session = useSession();
    const logOut = async () => {
        const requestObj = {
            method : "POST",
            headers : {
                "Authorization" : `Bearer ${session?.session}`
            }
        };
        await fetch(`${constants['BACKEND_URL']}/auth/logout`, requestObj)
        .catch((err) => {
            console.log('Error when loading out ', err.message);
        });
        session?.signOut();
    };

    return(
        <View>
            <Button 
                title = "press" 
                onPress={logOut}/>
        </View>
    );
}