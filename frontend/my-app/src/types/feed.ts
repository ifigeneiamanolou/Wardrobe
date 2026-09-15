import { ListRenderItem } from "react-native";

type Content = {
    url : string;
    description : string;
    urlProfile : string;
    username : string;
}

type DescriptionContent = {
    url : string;
    description : string;
    username : string;
}

interface ButtonMenuInterface {
    value : string;
    icon : string;
    onPress : () => void;
}

class ButtonMenu implements ButtonMenuInterface{
    value : string;
    icon : string;
    onPress : () => void;

    constructor(value : string, icon : string, onPress : () => void){
        this.value = value;
        this.icon = icon;
        this.onPress = onPress;
    }
}

type Menu = {
    icons : ButtonMenu[];
}

export {Content, ButtonMenu, Menu, DescriptionContent}