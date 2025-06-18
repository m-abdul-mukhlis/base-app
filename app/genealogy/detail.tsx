import ComponentHeader from "@/components/Header";
import ComponentScroll from "@/components/Scroll";
import { Text, View } from "@/components/Themed";
import UseFirestore from "@/components/useFirestore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";

export default function GenealogyDetail() {
  const { id, name, gender, par_rel, rel_id } = useLocalSearchParams()
  const [relation, setRelation] = useState<any>()
  const [child, setChild] = useState<any>()
  const [parents, setParents] = useState<any>()

  console.log(id, id, name, gender, par_rel, rel_id)

  useEffect(() => {
    getData()
  }, [])

  function getData() {
    if (rel_id && rel_id != "0") {
      getRelations(String(rel_id))
    }
    if (par_rel && par_rel != "0") {
      getParents(String(par_rel))
    }
  }

  function getRelations(rel_id: string) {
    const relation = rel_id?.split(",")
    // get relation
    UseFirestore().getCollectionWhere(["genealogy", "genealogy", "member"], [["rel_id", "array-contains-any", relation]], (data) => {
      if (data.length > 0) {
        const rel = data.filter((item: any) => item.id != id).map((item: any) => ({ ...item.data }))
        setRelation(rel)
      }
    }, console.warn)

    //get children
    UseFirestore().getCollectionWhere(["genealogy", "genealogy", "member"], [["par_rel", "array-contains-any", relation]], (data) => {
      if (data.length > 0) {
        const chil = data.map((item: any) => ({ ...item.data }))
        setChild(chil)
      }
    }, console.warn)
  }

  function getParents(par_rel: string) {
    const par = par_rel?.split(",")
    UseFirestore().getCollectionWhere(["genealogy", "genealogy", "member"], [["id", "in", par]], (data) => {
      if (data.length > 0) {
        const pare = data.map((item: any) => ({ ...item.data }))
        setParents(pare)
      }
    }, console.warn)
  }

  return (
    <View style={{ flex: 1 }}>
      <ComponentHeader title="ANGGOTA KELUARGA" />
      <ComponentScroll onRefresh={getData} >
        <View style={{ height: 115 }}>
          <View style={{ backgroundColor: "#f1f1f1", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, height: 90 }}>
            <Image source={{ uri: "" }} style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#e6e6e6", marginTop: 50, marginLeft: 15 }} contentFit="contain" />
          </View>
        </View>
        <View style={{ marginHorizontal: 15, flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 14 }}>{name}</Text>
            <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 10 }}>{gender == "m" ? "Laki-Laki" : "Perempuan"}</Text>
          </View>
          {
            ((relation && relation?.length != 0) || (child && child?.length != 0)) &&
            <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 10 }}>{`${relation?.length || 0} pasangan, ${child?.length || 0} anak`}</Text>
          }
        </View>

        <View style={{ height: 1, width: "80%", alignSelf: "center", marginTop: 20 }} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        {
          par_rel != "0" &&
          <View style={{ marginHorizontal: 15, marginTop: 20 }}>
            <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>{"Orang Tua"}</Text>
            {
              parents && parents?.length > 0 && parents.map((item: any, i: number) => {
                return (
                  <Pressable key={i} onPress={() => { }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 5 }}>
                    <Image source={{ uri: "" }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6" }} contentFit="contain" />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>{item?.name}</Text>
                      <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 10 }}>{item?.gender == "m" ? "Laki-Laki" : "Perempuan"}</Text>
                    </View>
                  </Pressable>
                )
              })
            }
          </View>
        }
        <View style={{ marginHorizontal: 15, marginTop: 20 }}>
          <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>{"Pasangan"}</Text>
          {
            relation && relation.length > 0 && relation.map((item: any, i: number) => {
              return (
                <Pressable key={i} onPress={() => { }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 5 }}>
                  <Image source={{ uri: "" }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6" }} contentFit="contain" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>{item?.name}</Text>
                    <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 10 }}>{item?.gender == "m" ? "Laki-Laki" : "Perempuan"}</Text>
                  </View>
                </Pressable>
              )
            })
          }
          <Pressable onPress={() => { }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 5 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="add" size={30} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>Tambahkan Pasangan</Text>
            </View>
          </Pressable>
        </View>
        <View style={{ marginHorizontal: 15, marginTop: 20 }}>
          <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>{"Anak"}</Text>
          {
            child && child.length > 0 && child.map((item: any, i: number) => {
              return (
                <Pressable key={i} onPress={() => { }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 5 }}>
                  <Image source={{ uri: "" }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6" }} contentFit="contain" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>{item?.name}</Text>
                    <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Light", fontSize: 10 }}>{item?.gender == "m" ? "Laki-Laki" : "Perempuan"}</Text>
                  </View>
                </Pressable>
              )
            })
          }
          <Pressable onPress={() => {
            router.push({
              pathname: '/genealogy/add',
              params: { par_rel: rel_id }
            })
          }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 5 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6e6e6", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="add" size={30} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 12 }}>Tambahkan Anak</Text>
            </View>
          </Pressable>
        </View>
      </ComponentScroll>
    </View>
  )
}