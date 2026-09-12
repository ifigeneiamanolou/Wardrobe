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
    name : string;
    favorite : boolean;
    _id : string;
}

type User = {
    image : string;
    username : string;
    email : string;
}

export {Item, Outfit, User};