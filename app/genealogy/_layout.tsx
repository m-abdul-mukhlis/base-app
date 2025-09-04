import { Stack } from "expo-router";

export default function GenealogyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="detail" />
      <Stack.Screen name="add" />
      <Stack.Screen name="family_add" />
    </Stack>
  )
}