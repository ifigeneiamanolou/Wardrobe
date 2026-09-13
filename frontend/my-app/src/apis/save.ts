import { Session} from "../ctx";
import {File} from 'expo-file-system';
import {fetch} from 'expo/fetch';
import showAlert from "../components/alert";
import constants from "../constants/app";

type saveProps = {
    favorite : boolean;
    name : string;
    size : string;
    shop : string;
    session : Session;
    uri : string;
    price : number;
    onEnd : () => void;
    onChange : () => void;
}

export async function saveItem({favorite, name, size, shop, session, onEnd, onChange, uri, price} : saveProps){
    const form = new FormData();
    const file = new File(uri);
    const favoriteNew = favorite ? "yes" : "no";
    form.append('name', name);
    form.append('favorite', favoriteNew);
    if(size)
        form.append('size', size);
    form.append('price', String(price));
    form.append('shop', shop);
    form.append('file', file);

    const url = `${constants.BACKEND_URL}/save/item`;
    const requestObj = {
        method : "POST",
        headers : {
            "Authorization" : `Bearer ${session?.session}`
        },
        body : form
    };
    
    return fetch(url, requestObj)
    .then(async (response) => {
        if(response.status == 401){
            session?.signOut();
            return;     // Avoid the catch block
        }

        if(!response.ok){
            showAlert('Error', 'Upload of image failed');
            return;
        };

        showAlert('Success', 'Image was uploaded');
        onChange();
    })
    .catch((err) => {
        console.log("Upload error", err.details);
        showAlert('Error', err.message);
    })
    .finally(() => {
        onEnd();
    })
}

