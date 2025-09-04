import { Text, View } from "@/components/Themed";
import useStorage from "@/components/useStorage";
import Utils from "@/constants/Utils";
import LibInput, { LibInputRef } from "@/lib/input";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Dimensions, Pressable, ScrollView } from "react-native";

const allCategories: any = {
  food: [
    { icons: "restaurant-outline", activeColor: "#5281ce" },
    { icons: "pizza-outline", activeColor: "#998ceb" },
    { icons: "fast-food-outline", activeColor: "#f39c12" },
    { icons: "beer-outline", activeColor: "#e74c3c" },
    { icons: "cafe-outline", activeColor: "#3498db" },
    { icons: "ice-cream-outline", activeColor: "#2ecc71" },
  ],
  transportation: [
    { icons: "car-sport-outline", activeColor: "#5281ce" },
    { icons: "bicycle-outline", activeColor: "#998ceb" },
  ]
}

const EXIN_KEY = "exinpockey-categories"

export function getData() {
  const data = useStorage.getItemSync(EXIN_KEY)
  const oldData = data ? typeof data == "string" ? JSON.parse(data) : data : null
  return oldData
}

export default function ExinCategories_add() {
  const { width } = Dimensions.get("window")
  const itemWidth = (width - 30) * 0.25
  const categoryRef = useRef<LibInputRef>(null)
  const [selectedCat, setSelectedCat] = useState<any>(allCategories["food"][0])

  function doAddCategories() {
    if (!selectedCat) {
      Alert.alert("Kategori kosong")
      return
    }
    if (categoryRef.current?.getText() == "") {
      Alert.alert("Nama kategori kosong")
      return
    }

    const post = {
      cat_label: categoryRef.current?.getText(),
      cat_icon: selectedCat?.icons,
      cat_color: selectedCat?.activeColor,
    }

    const data = useStorage.getItemSync(EXIN_KEY)
    let oldData: any[] = []
    try {
      if (data) {
        oldData = typeof data === "string" ? JSON.parse(data) : data
      }
    } catch (e) {
      console.warn("Failed to parse old data:", e)
      oldData = []
    }

    let newData = [...oldData, post]
    useStorage.setItem(EXIN_KEY, JSON.stringify(newData))
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 15, marginHorizontal: 18 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={20} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 15 }}>
        </View>
        <Pressable onPress={doAddCategories}>
          <Ionicons name='checkmark-sharp' size={20} />
        </Pressable>
      </View>
      <ScrollView>
        <LibInput
          icon={selectedCat?.icons}
          ref={categoryRef}
          returnKeyType="next"
          autoCapitalize="none"
          placeholder="Add New Category"
          style={{ fontSize: 12, paddingLeft: 10, color: "#000" }}
          onChangeText={() => { }}
        />
        <View style={{ marginTop: 20 }} />
        {
          Object.keys(allCategories).map((item: any, index: number) => (
            <View key={index}>
              <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: "Roboto-Medium", textAlign: "center" }}>{Utils.ucwords(item)}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginHorizontal: 15 }}>
                {
                  allCategories[item].map((icons: any, i: number) => {
                    const active = selectedCat?.icons == icons?.icons
                    return (
                      <Pressable key={i} onPress={() => {
                        setSelectedCat(icons)
                      }} style={{ width: itemWidth, height: itemWidth, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: 20, backgroundColor: active ? selectedCat.activeColor : '#f2f2f2' }}>
                          <Ionicons name={icons.icons} size={26} color={active ? "#f3f3f3" : "#989898"} />
                        </View>
                      </Pressable>
                    )
                  })
                }
              </View>
            </View>
          ))
        }
      </ScrollView>
    </View>
  )
}