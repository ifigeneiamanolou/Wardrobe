
import showAlert from "../components/alert";
import constants from "../constants/app";
import { Session } from "../ctx";

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
