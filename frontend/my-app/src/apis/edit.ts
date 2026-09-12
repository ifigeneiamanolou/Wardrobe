import constants from "../constants/app";
import { Session } from "../ctx";
import showAlert from "../components/alert";
import { File} from "expo-file-system";

type deleteType = {
    _id : string;
    type : string;
    session : Session
}

interface Dictionary<T> {
    [key: string]: T;
}

type toggleType = {
    _id : string;
    isFavorite : boolean;
    session : Session
}

type submitProps = {
    _id : string;
    value : string;
    type : string;
    onEnd : () => void;
    handleSubmit : (type : string) => string;
    handleChange : (type : string, value : string) => void;
    session : Session
}

type changePictureProps = {
    session : Session;
    image : string;
}

type changeUserDetailsProps = {
    session : Session;
    name : string;
    username : string;
    password : string;
    email : string;
}

export async function deleteItem({_id, type, session} : deleteType){
    return fetch(`${constants['BACKEND_URL']}/edit/delete`, {
        method : "POST",
        headers : {
            'Authorization' : `Bearer ${session?.session}`,
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            'id' : _id,
            'collection' : type,
        })
    })
    .then((async (res) => {
        if(res.status == 401){
            session?.signOut();
            return;
        }

        if(!res.ok){
            showAlert('Error', 'Error when changing favorite status');
        }
    }))
    .catch((err) => {
        console.log("Log in error", err);
        showAlert('Error', err.message);
    })
};

export async function submit({type, value, _id, onEnd, handleChange, handleSubmit, session} : submitProps){
    let temp = handleSubmit(type);
    return fetch(`${constants['BACKEND_URL']}/edit/value`, {
        method : "POST", 
        headers : {
            'Authorization' : `Bearer ${session?.session}`,
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            'id' : _id,
            'collection' : 'Items',
            'value' : value,
            'category' : type
        })
    }).then((async (res) => {
        if(res.status == 401){
            session?.signOut();
            return;
        }

        if(!res.ok){
            showAlert('Error', 'Error when changing the item details');
            value = temp;        // Change the displayed value to the previous one
        }

        handleChange(type, value);
    }))
    .catch((err) => {
        console.log("Log in error", err);
        showAlert('Error', err.message);

        // Change the displayed value to the previous one
        value = temp;
        handleChange(type, value);
    })
    .finally(() => {
        onEnd();
    })
};

export async function changeFavorite({_id, isFavorite, session} : toggleType){
    return fetch(`${constants['BACKEND_URL']}/edit/favorite`, {
        method : "POST",
        headers : {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${session?.session}`
        },
        body : JSON.stringify({
            'id' : _id,     
            'favorite' : isFavorite,
            'collection' : 'Items',
        })
    })
    .then((async (res) => {
        if(res.status == 401){
            session?.signOut();
            return;
        }

        if(!res.ok){
            showAlert('Error', 'Error when changing favorite status');
        }
    }))
    .catch((err) => {
        console.log("Log in error", err);
        showAlert('Error', err.message);
    })
};

export async function changeProfilePicture({session, image} : changePictureProps){
    // Format the request body
    const form = new FormData();
    const file = new File(image);
    form.append('image', file);

    const requestOj = {
        method : 'POST',
        headers : {'Authorization' : `Bearer ${session?.session}`},
        body : form
    };
    const url = `${constants.BACKEND_URL}/edit/profile/picture`;
    return fetch(url, requestOj)
    .then((response) => {
        if(response.status == 401){
            session?.signOut();
            return;     // Avoid the catch block
        }

        if(!response.ok){
            showAlert('Error', 'Change of profile picture failed!');
            return;
        };

        showAlert('Success', 'Profile picture successfully changed!');
    })
    .catch((err) => {
        console.log("Upload error", err);
        showAlert('Error', 'Change of profile picture failed!');
    })
}

export async function changeUserDetails({session, name, username, email, password} : changeUserDetailsProps){
    let body : Dictionary<string> = {};
    if (name !== ""){ body['name'] = name }
    if (username !== ""){ body['username'] = username }
    if (email !== ""){ body['email'] = email }
    if (password !== ""){ body['password'] = password }

    const requestOj = {
        method : 'POST',
        headers : {
            'Authorization' : `Bearer ${session?.session}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(body)
    };
    const url = `${constants.BACKEND_URL}/edit/profile/details`;

    return fetch(url, requestOj)
    .then((response) => {
        if(response.status == 401){
            session?.signOut();
            return;     // Avoid the catch block
        }

        if(!response.ok){
            showAlert('Error', 'Change of profile details failed!');
            return;
        };

        showAlert('Success', 'Profile details successfully changed!');
    })
    .catch((err) => {
        console.log("Upload error", err);
        showAlert('Error', 'Change of profile details failed!');
    })
}