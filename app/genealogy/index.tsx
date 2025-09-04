import ComponentButton from "@/components/Button";
import ComponentHeader from "@/components/Header";
import ComponentScroll from "@/components/Scroll";
import { Text, View } from "@/components/Themed";
import UseFirestore from "@/components/useFirestore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, TextInput } from "react-native";

export default function GenealogyIndex() {
  const { path_id } = useLocalSearchParams<{ path_id: string }>()
  const [data, setData] = useState<any>()
  const [query, setQuery] = useState<any>("")
  const inputRef = useRef<TextInput>(null)

  let res: any = []

  useEffect(() => {
    load()
  }, [])

  function load() {
    UseFirestore().getCollectionOrderBy(["genealogy", path_id, "member"], [["created", "asc"]], (result) => {
      result.forEach((v: any) => {
        res.push({ ...v.data })
      })
      setData(res)
    }, console.warn)
  }

  let filtered = query == "" ? data : data?.filter?.((item: any) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <ComponentHeader title="SEMUA ANGGOTA" />
      <ComponentScroll onRefresh={load} >
        {
          !data &&
          <ActivityIndicator color={"#ec4e1e"} />
        }
        {
          data &&
          <View style={{ marginTop: 15, marginBottom: 10, marginHorizontal: 15, borderColor: "#ec4e1e", borderWidth: 1, borderRadius: 10, height: 40, flexDirection: "row", alignItems: "center", paddingHorizontal: 15 }}>
            <TextInput
              ref={inputRef}
              style={{ flex: 1, color: "#ec4e1e" }}
              placeholder="Search name"
              placeholderTextColor={"#e6e6e6"}
              onChangeText={(t) => {
                setQuery(t)
              }}
            />
            {
              query != "" &&
              <Pressable onPress={() => {
                setQuery("")
                inputRef.current?.clear()
              }}>
                <Ionicons name="close-circle" size={24} color={"#989898"} />
              </Pressable>
            }
          </View>
        }
        {
          filtered && filtered?.length > 0 && filtered?.map?.((item: any, i: number) => {
            return (
              <Pressable key={i} onPress={() => {
                router.push({
                  pathname: '/genealogy/detail',
                  params: { ...item, path_id }
                })
              }} style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 15, marginTop: 15, marginBottom: 5 }}>
                <Image source={{ uri: item?.image || "" }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6" }} contentFit="contain" />
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
      {
        data &&
        <ComponentButton
          title="SHOW TREE"
          icons="trending-up"
          onPress={() => {
            router.push({
              pathname: '/user/test',
              params: { data: JSON.stringify(data), path_id }
            })
          }}
        />
      }
    </View >
  )
}