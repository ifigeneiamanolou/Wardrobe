import  { useEffect, useCallback, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value : T | null) => void]

// Boolean value is used to indicate the async operation is no longer loading
function useAsyncState<T>(
    initialValue : [boolean, T | null] = [true, null]
): UseStateHook<T>{
    return useReducer(
        (state : [boolean, T | null], action : T | null = null) : [boolean, T | null] => {
            return [false, action]
        },
        initialValue
    ) as UseStateHook<T>;           // Explicitly state the return type
}

// Function to store or delete a key-value pair from secure storage
export async function setStorageItemAsync(key : string, value : string | null){
    if(value == null){
        SecureStore.deleteItemAsync(key);
    } else{
        SecureStore.setItemAsync(key, value);
    }
}

export function useStorageState(key : string) : UseStateHook<string>{
    const [state, setState] = useAsyncState<string>();

    // get
    useEffect(() => {
        SecureStore.getItemAsync(key)
        .then((value : string | null) => {
            setState(value);
        })
        .catch((err) => {
            console.log('Error fetching key', err);
            setState(null);
        })
    }, [key]);

    // set
    const setValue = useCallback((value : string | null) => {
        setState(value);            // This is the JWT key 
        setStorageItemAsync(key, value);
    }, [key]);

    return [state, setValue];
}