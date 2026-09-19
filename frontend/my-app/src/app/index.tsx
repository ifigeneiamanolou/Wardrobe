import { Redirect } from "expo-router";
import { useSession } from "../context/ctx";
import React, { useEffect, useState } from "react";
import { validate } from "../apis/auth";
import * as Notifications from 'expo-notifications';
import Splash from "../components/splash";

Notifications.setNotificationHandler({
  // Modify how incoming notifications are handled
  handleNotification : async() => ({
    shouldPlaySound : true,
    shouldShowBanner : true,
    shouldShowList : true,
    shouldSetBadge : true
  })
})

export default function Index() {
  const session = useSession();
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

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

    // Register push notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification.request)
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response.userText);
    })

    return () => {
      notificationListener.remove();
      responseListener.remove();
    }
  }, [session?.isLoading]);

  if (session?.isLoading || checking) {
    return <Splash />
  }

  if (isValid) {
    return <Redirect href="/tabs" />;
  }

  return <Redirect href="/signIn" />;
}