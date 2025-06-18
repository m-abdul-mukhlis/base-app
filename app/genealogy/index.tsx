import ComponentHeader from "@/components/Header";
import ComponentScroll from "@/components/Scroll";
import { Text, View } from "@/components/Themed";
import UseFirestore from "@/components/useFirestore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";

export default function GenealogyIndex() {
  const [data, setData] = useState<any>()

  let res: any = []

  useEffect(() => {
    load()
  }, [])

  function load() {
    UseFirestore().getCollectionOrderBy(["genealogy", "genealogy", "member"], [["created", "asc"]], (result) => {
      result.forEach((v: any) => {
        res.push({ ...v.data })
      })
      setData(res)
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <ComponentHeader title="SEMUA ANGGOTA" />
      <ComponentScroll onRefresh={load} >
        {
          !data &&
          <ActivityIndicator color={"#ec4e1e"} />
        }
        {
          data && data.length > 0 && data?.map?.((item: any, i: number) => {
            return (
              <Pressable key={i} onPress={() => {
                router.push({
                  pathname: '/genealogy/detail',
                  params: { ...item }
                })
              }} style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 15, marginTop: 15, marginBottom: 5 }}>
                <Image source={{ uri: "" }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6" }} contentFit="contain" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>{item?.name}</Text>
                  <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 10 }}>{item?.gender == "m" ? "Laki-Laki" : "Perempuan"}</Text>
                </View>
                {/* {
                  i == 0 &&
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", paddingHorizontal: 4, paddingVertical: 3, borderRadius: 4 }}>
                    <FontAwesome name="star" size={10} color={"orange"} style={{ marginRight: 5 }} />
                    <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 8 }}>{"admin"}</Text>
                  </View>
                } */}
                {
                  item.par_rel == "0" &&
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", paddingHorizontal: 4, paddingVertical: 3, borderRadius: 4 }}>
                    <Ionicons name="person" size={10} color={"orange"} style={{ marginRight: 5 }} />
                    <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 8 }}>{"root"}</Text>
                  </View>
                }
              </Pressable>
            )
          })
        }
      </ComponentScroll>
    </View >
  )
}