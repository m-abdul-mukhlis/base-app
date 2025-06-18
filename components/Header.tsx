import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { Text, View } from "./Themed";

export interface Props {
  title: string
}
export default function ComponentHeader(props: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 15, backgroundColor: "#fff" }}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} />
      </Pressable>
      <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 14, flex: 1, textAlign: "center", textAlignVertical: "center" }}>{props?.title}</Text>
      <Pressable>
        <Ionicons name="notifications" size={20} />
      </Pressable>
    </View>
  )
}