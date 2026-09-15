import { Redirect } from "expo-router";
import { useSession } from "../ctx";
import Splash from "../components/splash";
import React, { useEffect, useState } from "react";
import { validate } from "../apis/auth";
// import * as Notifications from 'expo-notifications';

// Notifications.setNotificationHandler({
//   // Modify how incoming notifications are handled
//   handleNotification : async() => ({
//     shouldPlaySound : true,
//     shouldShowBanner : true,
//     shouldShowList : true,
//     shouldSetBadge : true
//   })
// })

export default function Index() {
  const session = useSession();
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  // const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  
  async function check(){
    if(session?.session){
      setChecking(false);
      return;
    }

    try{
      await validate({
        session : session,
        onChange : setIsValid,
        onEnd : () => setChecking(false)
      })
    } catch{
      setIsValid(false);
    }
  }

  useEffect(() => {
    // Check for valid credentials
    if(!session?.isLoading){
      check();
    }

    // Register notification and response listeners
    // const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    //   setNotification(notification);
    // });

    // const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    //   console.log(response.userText);
    // })

    // return () => {
    //   notificationListener.remove();
    //   responseListener.remove();
    // }
  }, [session?.isLoading]);

  if (session?.isLoading || checking) {
    return <Splash />;
  }

  if (isValid) {
    return <Redirect href="/tabs" />;
  }

  return <Redirect href="/signIn" />;
}