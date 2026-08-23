import {use, createContext, type PropsWithChildren} from 'react';
import { useStorageState } from './hooks/useStorageState';
import React from 'react';
import { router } from 'expo-router';

// Context provider
const AuthContext = createContext<{
    signIn: () => void;
    signOut : () => void;
    isLoading : boolean;
    session : string | null;
} | null>(null);

// Use this to access user information
export function useSession(){
    const value = use(AuthContext);
    if(!value){
        new Error('use session must be wrapped in a session provider');
    };
    return value;
}

// Wrapper around react components
export function SessionProvider({children} : PropsWithChildren){
    const [[isLoading, session], setSession] = useStorageState('session');      // session is our key

    return(
        // Provide context to the childer of this parent element
        <AuthContext.Provider 
            value = {{
                signIn : () => {
                    setSession('new');        // log in logic here
                },
                signOut : () => {
                    router.replace("/signIn");
                    setSession(null);
                },
                isLoading,
                session
            }}>  
            {children}
        </AuthContext.Provider>
    );
}