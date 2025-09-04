import { Stack } from 'expo-router';
import React from 'react';


export default function ExinLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='add' options={{ headerShown: false }} />
      <Stack.Screen name='categories_add' options={{ headerShown: false }} />
    </Stack>
  );
}
