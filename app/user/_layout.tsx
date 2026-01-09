import UseFirestore from '@/components/useFirestore';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { Redirect, Stack } from 'expo-router';
import React, { useEffect } from 'react';

// @ts-ignore
import shorthash from "shorthash";
import userClass from './class';

export default function UserLayout() {
  const { isSignedIn } = useAuth()
  const user = useUser()

  useEffect(() => {
    userClass.pushToken()
    const email = user?.user?.primaryEmailAddress?.emailAddress

    const subs = onAuthStateChanged(getAuth(), (user) => {
      if (!!user) {
        updateLastLogin(String(user?.email))
      } else {
        if (isSignedIn && email) {
          const password = UseFirestore().generatePassword(shorthash.unique(email), email)
          const instance: any = UseFirestore().instance()
          UseFirestore().register(instance, email, password, () => { })
        }
      }
    })

    return subs

  }, [])

  function updateLastLogin(email: string) {
    if (!userClass.get?.()?.email && email) {
      const instance: any = UseFirestore().instance()
      UseFirestore().getCollectionWhere(instance, ["genealogy", "genealogy", "users"], [["email", "==", email]], (data) => {
        if (data.length > 0) {
          userClass.set({ ...data[0].data })
        }
        const id = data[0].id
        // UseFirestore().updateDocument(["genealogy", "genealogy", "users", id], [{
        //   key: "lastLogin",
        //   // @ts-ignore
        //   value: serverTimestamp()
        // }], () => {
        // }, console.warn)
      }, console.warn)
    }
  }

  if (!isSignedIn) {
    return <Redirect href={'/(auth)'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='test' options={{ headerShown: false }} />
      <Stack.Screen name='edit' options={{ headerShown: false }} />
    </Stack>
  );
}
