import Splash from '@/components/Splash';
import UseFirestore from '@/components/useFirestore';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import userClass from '../user/class';

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const user = userClass.get()

  useEffect(() => {
    if (user) {
      UseFirestore().init()
    }
  }, [user])

  if (!isLoaded) {
    return <Splash />
  }

  if (isLoaded && isSignedIn) {
    return <Redirect href={'/user'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
