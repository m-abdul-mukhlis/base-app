import Splash from '@/components/Splash';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()

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
