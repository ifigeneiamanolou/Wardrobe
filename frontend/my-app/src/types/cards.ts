
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
}

// User cards for friends feature
type User = {
    image : string;
    username : string;
    email : string;
}

interface DragPayload {
    item : Item
}

export {Item, Outfit, User, DragPayload};