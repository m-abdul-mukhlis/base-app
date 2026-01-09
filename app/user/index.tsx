import ComponentModal, { ComponentModalRef } from "@/components/Modal";
import ComponentScroll from "@/components/Scroll";
import { Text, View } from "@/components/Themed";
import UseFirestore from "@/components/useFirestore";
import libImage from "@/lib/image";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, TouchableOpacity, useWindowDimensions } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import userClass from "./class";

export default function UserIndex() {
  const userData = userClass.get()
  const { width } = useWindowDimensions()
  const [image, setImage] = useState('')
  const itemWidth = (width - 50) * 0.333
  const menuWidth = (width - 80) * 0.206
  const modalRef = useRef<ComponentModalRef>(null);
  const ic = ["american-football", "boat-outline", "calendar-number-outline", "chatbubbles-outline", "cube-outline"]
  const [data, setData] = useState<any>([])

  const Items = (x: string, i: number) => {
    return (
      <TouchableOpacity onPress={() => {
        // router.navigate("/user/test")
        modalRef.current?.open()
      }} key={i} style={{ width: menuWidth, height: menuWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
        {/* @ts-ignore */}
        <Ionicons name={x} size={40} color={"#909090"} />
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    const instance: any = UseFirestore().instance()

    UseFirestore().getCollection(instance, ["genealogy"], (items) => {
      setData(items.map((doc) => ({ ...doc.data, ...doc })))
    }, console.warn)
  }

  if (data?.length == 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", margin: 15 }}>
        <Pressable onPress={() => router.navigate('/user/edit')} style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 15 }}>
          <Image source={{ uri: userData?.image }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6" }} contentFit="contain" />
          <View style={{ marginLeft: 10 }}>
            <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>Hello {userData?.name}</Text>
            <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 10 }}>{userData?.email}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => {
          router.push("/modal")
        }}>
          <Ionicons name="menu-outline" size={20} />
        </Pressable>
      </View>
      <ComponentScroll onRefresh={loadData} >

        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 15, flexWrap: "wrap" }}>
          {
            data && data?.map?.((item: any, index: number) => (
              <TouchableOpacity key={index} onPress={() => {
                // router.navigate("/genealogy")
                router.push({
                  pathname: '/genealogy',
                  params: { path_id: item.id }
                })
              }} style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                <FontAwesome5 name="tree" size={60} color={"#909090"} />
                <View style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 10, paddingVertical: 3, backgroundColor: "#e6e6e6" }}>
                  <Text allowFontScaling={false} numberOfLines={2} style={{ textAlign: "center", fontFamily: "Roboto-Medium", fontSize: 12, color: "#2c3e50" }}>{item?.name}</Text>
                </View>
              </TouchableOpacity>
            ))
          }
          <TouchableOpacity onPress={() => {
            libImage.fromCamera().then((res) => {
              setImage(res)
            })
          }} style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="camera" size={60} color={"#909090"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            // libImage.fromGallery().then((res) => {
            libImage.fromGallery({ crop: { forceCrop: true, ratio: "1:1" } }).then((res) => {
              console.log({ res })
              setImage(res)
            })
          }} style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="image-outline" size={60} color={"#909090"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            ImagePicker.openCamera({
              width: 400,
              height: 400,
              cropping: true,
            }).then((image) => {
              console.log(image);
            });

          }} style={{ width: itemWidth, height: itemWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="crop-outline" size={60} color={"#909090"} />
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
          <TouchableOpacity onPress={() => {
            router.navigate('/genealogy/family_add')
          }} style={{ width: menuWidth, height: menuWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <MaterialCommunityIcons name={"plus-circle"} size={40} color={"#909090"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            router.navigate('/exinpockey')
          }} style={{ width: menuWidth, height: menuWidth, backgroundColor: "#e6e6e6", marginRight: 10, marginBottom: 10, borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
            <MaterialCommunityIcons name={"currency-usd"} size={40} color={"#909090"} />
          </TouchableOpacity>
          {ic.map(Items)}
        </View>

      </ComponentScroll>
      <ComponentModal ref={modalRef} onClose={() => { }}>
        <Text style={{ fontSize: 18 }}>Drag down to dismiss</Text>
      </ComponentModal>
    </View>
  )
}