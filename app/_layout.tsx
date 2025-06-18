import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { KeyboardProvider } from "react-native-keyboard-controller";
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import userClass from './user/class';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    "Roboto-Light": require('../assets/fonts/Roboto-Light.ttf'),
    "Roboto-Medium": require('../assets/fonts/Roboto-Medium.ttf'),
    "Roboto-Regular": require('../assets/fonts/Roboto-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <KeyboardProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" translucent />
        <RootLayoutNav />
      </SafeAreaView>
    </KeyboardProvider>

  )
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const subs = onAuthStateChanged(getAuth(), (user) => {
      if (!!user) {
        userClass.set(user)
        router.replace("/user")
      } else {
        router.replace("/(auth)")
      }
    })
    return () => subs()
  }, [])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="user" options={{ headerShown: false }} />
        <Stack.Screen name="genealogy" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
