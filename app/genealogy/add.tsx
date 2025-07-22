import ComponentButton from "@/components/Button";
import ComponentHeader from "@/components/Header";
import ComponentsKeyboardAvoid from "@/components/KeyboardAvoid";
import ComponentModal, { ComponentModalRef } from "@/components/Modal";
import { Text, View } from "@/components/Themed";
import UseFirestore from "@/components/useFirestore";
import libImage from "@/lib/image";
import LibInput, { LibInputRef } from "@/lib/input";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";

export default function GenealogyAdd() {
  const { par_rel, id, edit } = useLocalSearchParams()
  const [gender, setGender] = useState("m")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>()
  const [image, setImage] = useState<string>("")
  const inputRef = useRef<LibInputRef>(null)
  const modalRef = useRef<ComponentModalRef>(null);
  const jekel = ["m", "f"]

  useEffect(() => loadData(), [])

  function loadData() {
    if (id && !!edit)
      UseFirestore().getDocument(["genealogy", "genealogy", "member", String(id)], ({ data }) => {
        setGender(data?.gender)
        if (data?.image && data?.image != "") {
          setImage(data?.image)
        }
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
        { key: "gender", value: gender },
        { key: "image", value: image }
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
          UseFirestore().updateDocument(["genealogy", "genealogy", "member", String(id)], [
            { key: "rel_id", value: data?.rel_id },
            { key: "image", value: image }
          ], () => { })
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
          <Pressable onPress={() => modalRef.current?.open()}>
            {
              image != "" ?
                <Image source={{ uri: image }} style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: "#e6e6e6", marginTop: 50, alignSelf: "center" }} contentFit="contain" />
                :
                <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: "#e6e6e6", marginTop: 50, alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name='camera' size={40} color='#f39c12' />
                </View>
            }
          </Pressable>
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
            doSave(!!edit ? true : false)
          }}
        />
      </View>
      <ComponentModal ref={modalRef}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 15, borderTopRightRadius: 15, paddingTop: 10, paddingBottom: 20 }}>
          <View style={{ width: 80, height: 5, borderRadius: 2.5, backgroundColor: '#e6e6e6', justifyContent: 'center', alignSelf: 'center' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Pressable onPress={() => {
              libImage.fromGallery({ crop: { forceCrop: true, ratio: "1:1" } }).then((res) => {
                setImage(res)
                modalRef.current?.close()
              })
            }} style={{ alignItems: 'center', padding: 20 }}>
              <View style={{ backgroundColor: '#ecf0f1', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }} >
                <Ionicons name='image' size={40} color='#f39c12' />
              </View>
              <Text allowFontScaling={false} style={{ fontFamily: 'InterRegular', fontSize: 10, marginTop: 2 }} >{'Gallery'}</Text>
            </Pressable>
            <Pressable onPress={() => {
              libImage.fromCamera({ crop: { forceCrop: true, ratio: "1:1" } }).then((res) => {
                setImage(res)
                modalRef.current?.close()
              })
            }} style={{ alignItems: 'center', padding: 20 }}>
              <View style={{ backgroundColor: '#ecf0f1', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }} >
                <Ionicons name='camera' size={40} color='#f39c12' />
              </View>
              <Text allowFontScaling={false} style={{ fontFamily: 'InterRegular', fontSize: 10, marginTop: 2 }} >{'Camera'}</Text>
            </Pressable>
          </View>
        </View>

      </ComponentModal>
    </ComponentsKeyboardAvoid >
  )
}