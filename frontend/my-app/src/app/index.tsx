import { Redirect } from "expo-router";
import { useSession } from "../ctx";
import Splash from "../components/splash";
import React from "react";

export default function Index() {
  const session = useSession();

  if (session?.isLoading) {
    return <Splash />;
  }

  if (session?.session) {
    return <Redirect href="/tabs" />;
  }

  return <Redirect href="/signIn" />;
}