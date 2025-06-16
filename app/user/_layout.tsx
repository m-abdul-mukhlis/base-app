import { Stack } from 'expo-router';
import React from 'react';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '453488482106-4bpiefd34rvbscsklv1egmnlr2ds29io.apps.googleusercontent.com',
})

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
