import {Alert} from 'react-native';

const showAlert = (title : string, message : string) => {
    Alert.alert(
        title,
        message,
        [
            {text : "OK", onPress : () => console.log("OK pressed")}
        ]
    )
};

export default showAlert;