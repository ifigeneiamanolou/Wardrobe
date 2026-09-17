import { Session} from "../context/ctx";
import {File} from 'expo-file-system';
import {fetch} from 'expo/fetch';
import showAlert from "../components/alert";
import constants from "../constants/app";
import { Item } from "../types/cards";

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

type saveOutfitProps = {
    image : string;       // base64 encoded outfit image
    items : Item[];
    title : string;
    description : string;
    favorite : boolean;
    session : Session;
    onEnd : () => void;
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

export async function saveOutfit({image, items, title, description, favorite, session, onEnd} : saveOutfitProps){
    const url = `${constants.BACKEND_URL}/save/outfit`;
    const body = JSON.stringify({
        image : image,
        items : items.map((v) => (v._id)),
        title : title,
        description : description,
        favorite : favorite ? 'yes' : 'no'
    });

    const requestObj = {
        method : "POST",
        headers : {
            "Authorization" : `Bearer ${session?.session}`,
            "Content-Type": "application/json"
        },
        body : body
    };

    return fetch(url, requestObj)
    .then(async (response) => {
        if(response.status == 401){
            session?.signOut();
            return;     // Avoid the catch block
        }

        if(!response.ok){
            onEnd();
            console.log(response.status);
            console.log(response.body)
            showAlert('Error', 'Upload of outfit failed');
            return;
        };

        showAlert('Success', 'Outfit was uploaded');
    })
    .catch((err) => {
        console.log('Error when uploading the outfit', err);
        showAlert('Error', 'Upload of outfit failed');
        return;
    })
    .finally(() => {
        onEnd();
    })
}
