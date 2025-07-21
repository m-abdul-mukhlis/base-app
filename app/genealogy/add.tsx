import ComponentButton from "@/components/Button";
import ComponentHeader from "@/components/Header";
import ComponentsKeyboardAvoid from "@/components/KeyboardAvoid";
import { Text, View } from "@/components/Themed";
import UseFirestore from "@/components/useFirestore";
import LibInput, { LibInputRef } from "@/lib/input";
import { FontAwesome } from "@expo/vector-icons";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";

export default function GenealogyAdd() {
  const { par_rel, id, edit } = useLocalSearchParams()
  const [gender, setGender] = useState("m")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>()
  const inputRef = useRef<LibInputRef>(null)
  const jekel = ["m", "f"]

  useEffect(() => loadData(), [])

  function loadData() {
    if (id && !!edit)
      UseFirestore().getDocument(["genealogy", "genealogy", "member", String(id)], ({ data }) => {
        setGender(data?.gender)
        setData(data)
      }, console.warn)
  }

  function doSave(isEdit: boolean) {

    if (name == "") {
      Alert.alert("Nama tidak boleh kosong")
      return
    }

    setLoading(true)

    if (isEdit) {
      UseFirestore().updateDocument(["genealogy", "genealogy", "member", String(id)], [
        { key: "name", value: name },
        { key: "gender", value: gender }
      ], () => {
        setLoading(false)
        router.back()
      })
    } else {
      const key = UseFirestore().generateId
      const data: any = {
        id: key,
        name: name,
        gender: gender,
        created: serverTimestamp(),
        par_rel: String(par_rel).split(","),
      }
      if (id) {
        data.rel_id = [key, id]
      }

      UseFirestore().addDocument(["genealogy", "genealogy", "member", key], data, () => {
        if (!!id) {
          UseFirestore().updateDocument(["genealogy", "genealogy", "member", String(id)], [{ key: "rel_id", value: data?.rel_id }], () => { })
        }
        setName("")
        inputRef.current?.setText("")
        setLoading(false)
        router.back()
      }, () => setLoading(false))
    }

  }

  return (
    <ComponentsKeyboardAvoid style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ComponentHeader title={!!edit ? "UBAH DATA " : "TAMBAH KELUARGA"} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <LibInput
            ref={inputRef}
            placeholder="Nama"
            defaultValue={data?.name}
            autoCapitalize="words"
            keyboardType="default"
            onChangeText={(t) => {
              setName(t)
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center', marginTop: 15 }}>
            {
              jekel.map((x, i) => (
                <Pressable onPress={() => setGender(x)} key={i} style={{ padding: 10, backgroundColor: "#e6e6e6", marginRight: 10, width: 90, height: 90, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                  <FontAwesome name={x == "m" ? "male" : "female"} color={gender == x ? "orange" : "#000"} size={24} />
                  <Text style={{ color: gender == x ? "orange" : "#000", fontSize: 10, marginTop: 10 }} >{x == "m" ? "Laki-Laki" : "Perempuan"}</Text>
                </Pressable>
              ))
            }
          </View>
        </ScrollView>
        <ComponentButton
          title="SIMPAN"
          loading={loading}
          onPress={() => {
            doSave(edit == 1 ? true : false)
          }}
        />
      </View>
    </ComponentsKeyboardAvoid>
  )
}