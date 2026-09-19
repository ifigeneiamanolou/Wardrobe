import constants from "../constants/app";
import { Session } from "../context/ctx";
import showAlert from "../components/alert";
import { User } from "../types/cards";

type loadProps = {
    session : Session;
    onEnd : (users : User[]) => void;
    noRessources : () => void;
}

type NotificationProps = {
    push_token : string;    // Expo push token registered with the user
    title : string;
    body : string;
    username : string;      // User to where message will go to
    session : Session;
    onUnregistered : (push_token : string) => void;
}

type requestProps = {
    username : string;
    session : Session;
    noRessources : () => void;
    onEnd : (username : string) => void;
}

export async function loadRequests({session, onEnd, noRessources} : loadProps){
    const url = `${constants['BACKEND_URL']}/load/notifications`;
    const requestObj = {
        method : 'GET',
        headers : {
            'Accept' : 'application/json',
            'Authorization' : `Bearer ${session?.session}`
        }
    };

    try{
        const response = await fetch(url, requestObj);

        if(response.status == 401){
            session?.signOut();
            return;
        };

        if(response.status == 404){
            noRessources();
            return;
        }

        if(!response.ok){
            showAlert('Error', 'Loading of notifications failed!');
            return;
        };

        const result = await response.json();
        const requests = result['requests'];
        const users : User[] = []
        for(const request of requests){
            const user : User = {
                'push_token' : request['push_token'],
                'email' : request['email'],
                'image' : request['image'],
                'username' : request['username']
            }
            users.push(user)
        }
        onEnd(users);
    } catch(err){
        console.log("Loading error", err);
        showAlert('Error', 'Loading of notifications failed!');
    }
}

export async function loadFriends({session, onEnd, noRessources} : loadProps){
    const url = `${constants['BACKEND_URL']}/load/friends`;
    const requestObj = {
        method : 'GET',
        headers : {
            'Accept' : 'application/json',
            'Authorization' : `Bearer ${session?.session}`
        }
    };

    try{
        const response = await fetch(url, requestObj);

        if(response.status == 401){
            session?.signOut();
            return;
        };

        if(response.status == 404){
            noRessources();
            return;
        }

        if(!response.ok){
            showAlert('Error', 'Loading of friends failed!');
            return;
        };

        const result = await response.json();
        const requests = result['friends'];
        const users : User[] = []
        for(const request of requests){
            const user : User = {
                "push_token" : request['push_token'],
                'email' : request['email'],
                'image' : request['image'],
                'username' : request['username']
            }
            users.push(user)
        }
        onEnd(users);
    } catch(err){
        console.log("Loading error", err);
        showAlert('Error', 'Loading of friends failed!');
    }
}

export async function acceptRequest({username, onEnd, session, noRessources} : requestProps){
    const url = `${constants['BACKEND_URL']}/edit/accept/request`;
    const requestObj = {
        method : 'POST',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${session?.session}`
        },
        body : JSON.stringify({'username' : username})
    };

    try{
        const response = await fetch(url, requestObj);

        if(response.status == 401){
            session?.signOut();
            return;
        };

        if(response.status == 404){
            noRessources();
            return;
        }

        if(!response.ok){
            showAlert('Error', 'Accepting a request failed!');
            return;
        };

        // Given the request was successful update the list of notifications by deleting it
        onEnd(username);
    } catch(err){
        console.log("Update error", err);
        showAlert('Error', 'Accepting of request failed!');
    }
}

export async function makeRequest({username, onEnd, session, noRessources} : requestProps){
    const url = `${constants['BACKEND_URL']}/edit/friend/request`;
    const requestObj = {
        method : 'POST',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${session?.session}`
        },
        body : JSON.stringify({'username' : username})
    };

    try{
        const response = await fetch(url, requestObj);

        if(response.status == 401){
            session?.signOut();
            return;
        };

        if(response.status == 404){
            noRessources();
            return;
        }

        if(!response.ok){
            showAlert('Error', 'Making a request failed!');
            return;
        };

        // Function to call given the request was successful
        onEnd(username);
    } catch(err){
        console.log("Upload error", err);
        showAlert('Error', 'Request failed!');
    }
}

export async function deleteFriend({username, onEnd, session, noRessources} : requestProps){
    const url = `${constants['BACKEND_URL']}/edit/friend/delete`;
    const requestObj = {
        method : 'POST',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${session?.session}`
        },
        body : JSON.stringify({'username' : username})
    };

    try{
        const response = await fetch(url, requestObj);

        if(response.status == 401){
            session?.signOut();
            return;
        };

        if(response.status == 404){
            noRessources();
            return;
        }

        if(!response.ok){
            showAlert('Error', 'Removing friend failed!');
            return;
        };

        // Given the request was successful delete the user from the list
        onEnd(username);
    } catch(err){
        console.log("Delete error", err);
        showAlert('Error', 'Delete operation failed!');
    }
}

export async function sendNotification({push_token, title, body, username, session, onUnregistered} : NotificationProps){
    const url = `${constants['BACKEND_URL']}/notifications/send`;
    const requestObj = {
        method : 'POST',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${session?.session}`
        },
        body : JSON.stringify({
            'username' : username,
            'push_token' : push_token,
            'title' : title,
            'body' : body
        })
    };

    try{
        const response = await fetch(url, requestObj);

        if(response.status == 401){
            session?.signOut();
            return;
        };

        if(response.status == 406){
            console.log(`Device with token ${push_token} is unregistered`);
            onUnregistered(push_token);
            return;
        };

        if(!response.ok){
            console.log(`Unable to send notification to device with token ${push_token}`)
            return;
        };
    } catch(err){
        console.log(`Unable to send notification to device with token ${push_token} with error: ${err}`);
    }
}