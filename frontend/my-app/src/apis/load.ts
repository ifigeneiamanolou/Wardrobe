
import showAlert from "../components/alert";
import constants from "../constants/app";
import { Session } from "../context/ctx";
import { User } from "../types/cards";

type ItemProps = {
    cleanup : () => void;
    onItemChunk : (line : string) => void;
    session : Session
    onEmpty : () => void;
}

type OutfitProps = {
    cleanup : () => void;
    onOutfitChunk : (line : string) => void;
    session : Session
    onEmpty : () => void;
}

type loadDetailsProps = {
    session : Session;
}

type loadUsersProps = {
    session : Session;
    onEnd : (users : User[]) => void;
}

type ItemsFromOutfitProps = {
    session : Session;
    item_ids : [string];
}

type SavedOutfitProps = {
    session : Session;
    onLoad : () => void;         // Signal the start of loading to stop the loading dots      
    onOutfitChunk : (line : string) => void;        // Handle a single outfit fetched from the db
    onEmpty : () => void;       // Signal that no outfits have been found
}

export async function fetchItems ({cleanup, onItemChunk, session, onEmpty} : ItemProps) {
    if(session?.session === null || session?.session === undefined){
        console.log('Token is null');
        session?.signOut();
        return;
    }
        
    const resp = await fetch(`${constants['BACKEND_URL']}/load/items`, {
        headers : {
            'Accept' : 'text/event-stream',
            'Authorization' : `Bearer ${session.session}`
        }
    });

    // Handle unauthorized requests
    if(resp.status == 401){
        session.signOut();
        return;
    };

    // Handle no items present in the db
    if(resp.status == 404){
        onEmpty();
        return;
    }

    if(!resp.ok){
        showAlert('Error', 'Load of items failed');
        return;
    };

    const reader = resp.body?.getReader();
    let buffer = "";                                // Handle image data
    const decoder = new TextDecoder();              // Decode bytes into JS string
    cleanup();

    const processText = ({value, done, } : ReadableStreamReadResult<Uint8Array>) : Promise<void> | void => {
        // Handle the end of data
        if(done){
            console.log('done');
            return;
        }

        const text = decoder.decode(value, {stream : true});
        buffer += text;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? "";
        for(const line of lines){
            if(line.trim()){
                onItemChunk(line.trim());
            }
        }
        return reader?.read().then(processText);  // continue reading
    }

    if(reader){
        reader.read().then(processText);
    }
}

export async function fetchOutfits ({cleanup, onOutfitChunk, session, onEmpty} : OutfitProps){
    if(session?.session === null || session?.session === undefined){
        console.log('Token is null');
        session?.signOut();
        return;
    }

    const resp = await fetch(`${constants['BACKEND_URL']}/load/outfits`, {
        headers : {
            'Accept' : 'text/event-stream',
            'Authorization' : `Bearer ${session.session}`
        }
    });

    // Handle unauthorized requests
    if(resp.status == 401){
        session.signOut();
        return;
    };

    // Handle no outfits present in the db
    if(resp.status == 404){
        onEmpty();
        return;
    }

    if(!resp.ok){
        showAlert('Error', 'Load of outfits failed');
        return;
    };

    const reader = resp.body?.getReader();
    let buffer = "";
    const decoder = new TextDecoder();  // Decode bytes into JS string
    cleanup();

    const processText = ({value, done} : ReadableStreamReadResult<Uint8Array>) : Promise<void> | void => {
        if(done){
            console.log('done');
            return;
        }

        const text = decoder.decode(value, {stream : true});
        buffer += text;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? "";
        for(const line of lines){
            if(line.trim()){
                console.log(line.trim())
                onOutfitChunk(line.trim());
            }
        }
            
        return reader?.read().then(processText);  // continue reading
    }

    if(reader){
        reader.read().then(processText);
    }
}

export async function fetchProfile({session} : loadDetailsProps) : Promise<any>{
    const requestOj = {
        method : 'GET',
        headers : {
            'Authorization' : `Bearer ${session?.session}`,
            'Content-Type' : 'application/json'
        }
    };
    const url = `${constants.BACKEND_URL}/load/profile`;

    try{
        const response = await fetch(url, requestOj);

        if(response.status == 401){
            session?.signOut();
            return null;     // Avoid the catch block
        };

        if(!response.ok){
            showAlert('Error', 'Loading of user details failed!');
            return null;
        };

        return await response.json();
    }catch(err){
        console.log("Loading error", err);
        showAlert('Error', 'Loading of user details failed!');
        return null;
    }
}

export async function fetchUsers({session, onEnd} : loadUsersProps){
    try{
        const response = await fetch(`${constants['BACKEND_URL']}/load/users`, {
            method : 'GET',
            headers : {
                'Authorization' : `Bearer ${session?.session}`
            }
        });
        
        if(response.status == 401){
            session?.signOut();
            return;
        };

        if(!response.ok){
            showAlert('Error', 'Loading of users failed!');
            return;
        };

        const result = await response.json();
        const users = result['users'];
        onEnd(users);
    } catch(err){
        console.log("Loading error", err);
        showAlert('Error', 'Loading of user details failed!');
        return null;
    }
}

export async function loadItemsFromOutfit({session, item_ids} : ItemsFromOutfitProps){
    try{
        const response = await fetch(`${constants['BACKEND_URL']}/load/outfits/items`, {
            method : 'GET',
            headers : {
                'Authorization' : `Bearer ${session?.session}`
            },
            body : JSON.stringify({item_ids : item_ids})
        });
        
        if(response.status == 401){
            session?.signOut();
            return;
        };

        if(!response.ok){
            showAlert('Error', 'Loading of users failed!');
            return;
        };

        const result = await response.json();
        const images = await result['items'];
        return images;
    } catch(err){
        console.log("Loading error", err);
        showAlert('Error', 'Loading of user details failed!');
        return null;
    }
}

export async function loadSavedOutfits({session, onLoad, onEmpty, onOutfitChunk} : SavedOutfitProps){
    if(session?.session === null || session?.session === undefined){
        console.log('Token is null');
        session?.signOut();
        return;
    }

    const resp = await fetch(`${constants['BACKEND_URL']}/load/outfits/saved`, {
        headers : {
            'Accept' : 'text/event-stream',
            'Authorization' : `Bearer ${session.session}`
        }
    });

    // Handle unauthorized requests
    if(resp.status == 401){
        session.signOut();
        return;
    };

    // Handle no outfits present in the db
    if(resp.status == 404){
        onEmpty();
        return;
    }

    if(!resp.ok){
        showAlert('Error', 'Load of outfits failed');
        return;
    };

    const reader = resp.body?.getReader();
    let buffer = "";
    let index = 0;                      // Keep track of the number of outfits received
    const decoder = new TextDecoder();  // Decode bytes into JS string

    const processText = ({value, done} : ReadableStreamReadResult<Uint8Array>) : Promise<void> | void => {
        if(done){
            console.log('done');
            return;
        }

        const text = decoder.decode(value, {stream : true});
        buffer += text;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? "";
        for(const line of lines){
            if(line.trim()){
                index = index + 1;
                console.log(line.trim());            // Log the line loaded by the db in the console
                onOutfitChunk(line.trim());
                if(index == 1){
                    onLoad();
                }
            }
        }   
        return reader?.read().then(processText);  // continue reading
    }

    if(reader){
        reader.read().then(processText);
    }
}
