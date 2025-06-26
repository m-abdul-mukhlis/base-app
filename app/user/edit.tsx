import ComponentButton from "@/components/Button";
import ComponentHeader from "@/components/Header";
import ComponentScroll from "@/components/Scroll";
import { View } from "@/components/Themed";
import UseFirestore from "@/components/useFirestore";
import LibInput, { LibInputRef } from "@/lib/input";
import { Ionicons } from "@expo/vector-icons";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable } from "react-native";
import userClass from "./class";

export default function UserEdit() {
  const userData = userClass.get()
  const [image, setImage] = useState(userData?.image || "")
  const [loading, setLoading] = useState(false)
  const nameRef = useRef<LibInputRef>(null)
  const emailRef = useRef<LibInputRef>(null)
  const { imageUri } = useLocalSearchParams()

  useEffect(() => {
    if (imageUri) {
      setImage(imageUri)
    }
  }, [imageUri])

  function saveUserData() {
    setLoading(true)
    UseFirestore().updateDocument(["genealogy", "genealogy", "users", userData.id], [
      { key: "name", value: nameRef.current?.getText?.() || userData?.name || "" },
      { key: "image", value: image },
      { key: "updated", value: serverTimestamp() }
    ], () => {
      UseFirestore().getDocument(["genealogy", "genealogy", "users", userData.id], (result) => {
        userClass.set({ ...result?.data })
        router.back()
        setLoading(false)
      })
    }, () => {
      Alert.alert("Gagal mengupdate data")
      setLoading(false)
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <ComponentHeader title="User Edit" />
      <ComponentScroll>
        <Pressable onPress={() => {
          router.navigate("/user/test")
        }} style={{ width: 100, height: 100, borderRadius: 50, alignSelf: "center", marginVertical: 10, overflow: "hidden" }}>
          <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "#e6e6e6" }} contentFit="contain" />
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center", backgroundColor: 'rgba(0, 0, 0, 0.45)', height: 32 }}>
            <Ionicons name="camera-outline" color={"white"} size={20} />
          </View>
        </Pressable>

        <LibInput
          ref={nameRef}
          defaultValue={userData?.name}
          icon="person-outline"
          returnKeyType="next"
          autoCapitalize="none"
          placeholder="Name..."
          onSubmitEditing={() => emailRef.current?.focus?.()}
        />
        <LibInput
          ref={emailRef}
          defaultValue={userData?.email}
          editable={false}
          icon="mail-outline"
          returnKeyType="next"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email..."
          textStyle={{ color: "#8b8b8b" }}
          onSubmitEditing={() => { }}
        />
      </ComponentScroll>
      <ComponentButton
        title="SIMPAN"
        loading={loading}
        onPress={() => { saveUserData() }}
      />
    </View>
  )
}