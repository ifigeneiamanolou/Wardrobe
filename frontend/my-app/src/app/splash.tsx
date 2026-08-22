// Used to render a splash screen while authenticating the user
import { SplashScreen } from "expo-router";
import { useSession } from "../ctx";

// Prevent splash screen hiding before ressources are loaded
SplashScreen.preventAutoHideAsync();

export default function Splash(){
    const session = useSession();

    if(!session?.isLoading){
        SplashScreen.hide();
    }
  
    return null;
}