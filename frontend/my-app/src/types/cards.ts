
// Item cards
type Item = {
    shop : string;
    favorite : boolean;
    size : string;
    price : string;
    category : string;
    color : string;
    name : string;
    image : string;
    _id : string;
};

type Outfit = {
    image : string;
    description : string;
    name : string;
    favorite : boolean;
    _id : string;
    item_ids : [string];            // List of ids for the items inside the outfit
}

// User cards for friends feature
type User = {
    image : string;
    username : string;
    email : string;
    push_token : string;
    item_ids_saved : [string];          // List of ids the user has saved from his friend through the feed
}

interface DragPayload {
    item : Item
}

export {Item, Outfit, User, DragPayload};