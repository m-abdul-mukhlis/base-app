import { Image } from "expo-image";
import { ActivityIndicator } from "react-native";
import { View } from "./Themed";

export default function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
      <Image source={require("../assets/images/adaptive-icon.png")} style={{ width: 200, height: 200 }} contentFit="contain" />
      <ActivityIndicator color={"#ffb125"} size={"large"} />
    </View>
  )
}