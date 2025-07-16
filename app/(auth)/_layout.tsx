import { View } from '@/components/Themed';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    )
  }

  if (isLoaded && isSignedIn) {
    return <Redirect href={'/user'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
