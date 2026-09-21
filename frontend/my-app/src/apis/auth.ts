import constants from "../constants/app";
import showAlert from "../components/alert";
import {router} from 'expo-router';
import { Session } from "../context/ctx";
import { setShouldAnimateExitingForTag } from "react-native-reanimated/lib/typescript/core";

type changePasswordParams = {
    username : string;
    password : string;
    onEnd : () => void;
    session : Session;
}

type UploadParams = {
    token : string;
    session : Session;
}

type signUpParams = {
    name : string,
    email : string,
    username : string,
    password : string,
    onEnd : () => void,
    token : string
}

type logOutParams = {
    session : Session
}

type UserCheckParams = {
    onEnd : () => void,
    onChange : (value : boolean) => void,
    session : Session
}

type GoogleLogInParams = {
    session : Session;
    idToken : string | undefined;
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
    return fetch(url, requestObj)
    .then((res) => {
        if(!res.ok){
            showAlert('Error', 'Change of password failed');
            return;
        };
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

    return fetch(url, configObj)
    .then(async (response) => {
        if(response.status == 401){
            showAlert('Error', "Username or password isn' valid");
            return;
        };

        if(!response.ok){
            showAlert('Error', 'Log in failed');
            console.log('log in error status: ', response.status)
            return;
        };
        const dict = await response.json();
        session?.signIn(dict);  
    })
    .catch((err) => {
        console.log("Log in error", err);
        showAlert('Error', 'Login failed');
    })
    .finally(() => {
        onEnd();
    })
}

export async function signup({name, username, password, email, onEnd, token} : signUpParams){
    const requestObj = {
        method : "POST",
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({
            "username" : username,
            "name" : name,
            "email" : email,
            "password" : password,
            "push_token" : token
        })
    }
    
    const url = `${constants.BACKEND_URL}/auth/signup`;
    return fetch(url, requestObj)
    .then((res) => {
        if(!res.ok){
            showAlert('Error', 'Sign up failed');
            return;
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

export async function validate({session, onEnd, onChange} : UserCheckParams){
    return fetch(`${constants['BACKEND_URL']}/auth/users/me`, {
        method : "GET",
        headers : {Authorization : `Bearer ${session?.session}`}
    })
    .then((res) => {
        onChange(res.ok);
    })
    .catch(() => {
        onChange(false);
    })
    .finally(() => {
        onEnd();
    })
}

export async function googleSubmit({idToken, session} : GoogleLogInParams){
    const requestObj = { // TO DO : MOVE TO HTTPS REQUEST
        method : "POST",
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify({
            "idToken" : idToken,
        })
    }
    const url = `${constants.BACKEND_URL}/auth/token/google`;

    const response = await fetch(url, requestObj);
    const data = await response.json();

    if(response.status == 401){
        showAlert('Error', data.detail);
        return;
    }

    if(!response.ok){
        showAlert('Error', 'Log in failed');
        console.log('log in error status: ', response.status)
        return;
    };

    // Sign in if the request was successful
    session?.signIn(data);    
}
