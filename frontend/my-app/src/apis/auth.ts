import constants from "../constants/app";
import showAlert from "../components/alert";
import {router} from 'expo-router';
import { Session } from "../ctx";

type changePasswordParams = {
    username : string;
    password : string;
    onEnd : () => void;
    session : Session;
}

type signUpParams = {
    name : string,
    email : string,
    username : string,
    password : string,
    onEnd : () => void;
}

type logOutParams = {
    session : Session
}

export const logOut = async ({session} : logOutParams) => {
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

export const changePasswordCall = async ({username, password, onEnd, session} : changePasswordParams) => {
    const requestObj = {
        "method" : "POST",
        "headers" : {"Content-Type" : "application/json"},
        "body" : JSON.stringify({
            "username" : username,
            "password" : password
        }),
    }
    const url = `${constants['BACKEND_URL']}/auth/change/password`;
    fetch(url, requestObj)
    .then((res) => {
        if(!res.ok){
            throw new Error('Server rejected request');
        }
        session?.signOut();
        showAlert('Success', 'Password has successfully changed');
        router.replace('/signIn');
    })
    .catch((reason : any) => {
        if(reason.name == "PasswordIsIdentical"){
            console.log(`Identical password`);
            showAlert('Error', 'A different password needs to be selected');
        }
        console.log(`Error from the server during sign up with reason ${reason}`);
        showAlert('Error', 'Server error ... Try again');
    })
    .finally(() => {
        onEnd();
    })
}

export async function login({username, password, onEnd, session} : changePasswordParams) {
    const url = `${constants.BACKEND_URL}/auth/token`;
    const data = new URLSearchParams({
        "username" : username,
        "password" : password
    })
    const configObj = {
        method : "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body : data.toString()
    };
    fetch(url, configObj)
    .then(async (response) => {
        if(!response.ok){
            throw new Error('Log in failed');
        }
        const dict = await response.json();
        session?.signIn(dict);  
    })
    .catch((err) => {
        console.log("Log in error", err);
        showAlert('Error', err.message);
    })
    .finally(() => {
        onEnd();
    })
}

export async function signup({name, username, password, email, onEnd} : signUpParams){
    const requestObj = {
        method : "POST",
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({
            "username" : username,
            "name" : name,
            "email" : email,
            "password" : password
        })
    }
    
    const url = `${constants.BACKEND_URL}/auth/signup`;
    fetch(url, requestObj)
    .then((res) => {
        if(!res.ok){
            throw new Error('Server rejected request');
        }
        showAlert('Success', 'Successful sign up');
        router.replace('/signIn');
    })
    .catch((reason) => {
        console.log(`Error from the server during sign up with reason ${reason.name} and message ${reason.message}`);
        showAlert('Error', 'Server error ... Try again');
    })
    .finally(() => {
        onEnd()
    })
}

    