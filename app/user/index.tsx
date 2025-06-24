import { Text, View } from "@/components/Themed";
import libImage from "@/lib/image";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TouchableOpacity, useWindowDimensions } from "react-native";
import userClass from "./class";

export default function UserIndex() {
  const userData = userClass.get()
  const { width } = useWindowDimensions()
  const [image, setImage] = useState('')
  const itemWidth = (width - 50) * 0.333
  const menuWidth = (width - 80) * 0.206
  const ic = ["american-football", "boat-outline", "calendar-number-outline", "chatbubbles-outline", "cube-outline"]

  const Items = (x: string, i: number) => {
    return (
      <TouchableOpacity onPress={() => {

      }} key={i} style={{ width: menuWidth, height: menuWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
        {/* @ts-ignore */}
        <Ionicons name={x} size={40} color={"#909090"} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", margin: 15 }}>
        <Image source={{ uri: userData?.photoURL }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6" }} contentFit="contain" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>Hello {userData?.name}</Text>
          <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 10 }}>{userData?.email}</Text>
        </View>
        <Pressable onPress={() => {
          router.push("/modal")
        }}>
          <Ionicons name="menu-outline" size={20} />
        </Pressable>
      </View>
      <ScrollView>

        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 15, flexWrap: "wrap" }}>
          <TouchableOpacity onPress={() => {
            router.navigate("/genealogy")
          }} style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <FontAwesome5 name="tree" size={60} color={"#909090"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            libImage.fromCamera().then((res) => {
              setImage(res)
            })
          }} style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="camera" size={60} color={"#909090"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            libImage.fromGallery().then((res) => {
              setImage(res)
            })
          }} style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="image-outline" size={60} color={"#909090"} />
          </TouchableOpacity>
          <View style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <Image
              source={{ uri: 'https://ik.imagekit.io/bringthecode/bbo-logo_0KMkUHReu.png' }}
              style={{ width: itemWidth - 20, height: itemWidth - 20 }}
              contentFit="contain"
            />
          </View>
          {
            image != "" &&
            <View style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
              <Image
                source={{ uri: image }}
                style={{ width: itemWidth - 20, height: itemWidth - 20 }}
                contentFit="contain"
              />
            </View>
          }
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 15, flexWrap: "wrap" }}>
          {ic.map(Items)}
        </View>

      </ScrollView>
    </View>
  )
}