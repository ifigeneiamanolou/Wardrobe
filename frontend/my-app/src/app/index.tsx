import { Redirect } from "expo-router";
import { useSession } from "../ctx";
import Splash from "../components/splash";
import React, { useEffect, useState } from "react";
import { validate } from "../apis/auth";

export default function Index() {
  const session = useSession();
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
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

    if(!session?.isLoading){
      check();
    }
    
  }, [session?.isLoading]);

  if (session?.isLoading || checking) {
    return <Splash />;
  }

  if (isValid) {
    return <Redirect href="/tabs" />;
  }

  return <Redirect href="/signIn" />;
}