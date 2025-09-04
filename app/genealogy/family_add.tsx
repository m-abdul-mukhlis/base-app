import ComponentButton from "@/components/Button";
import ComponentHeader from "@/components/Header";
import ComponentsKeyboardAvoid from "@/components/KeyboardAvoid";
import { View } from "@/components/Themed";
import LibInput, { LibInputRef } from "@/lib/input";
import { doc, getFirestore, serverTimestamp, writeBatch } from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function GenealogyFamily_add() {
  const [family, setFamily] = useState("")
  const [name, setName] = useState("")
  const [partner, setPartner] = useState("")
  const [loading, setLoading] = useState(false)
  const familyRef = useRef<LibInputRef>(null)
  const nameRef = useRef<LibInputRef>(null)
  const partnerRef = useRef<LibInputRef>(null)

  function doSave() {

    if (name == "") {
      Alert.alert("Nama Kepala Keluarga tidak boleh kosong")
      return
    }
    if (family == "") {
      Alert.alert("Nama Keluarga tidak boleh kosong")
      return
    }
    if (partner == "") {
      Alert.alert("Nama Pasangan tidak boleh kosong")
      return
    }

    setLoading(true)

    const famName = family.replace(/\s+/g, '-').toLowerCase().trim()
    const data = [
      {
        created: serverTimestamp(),
        gender: "m",
        id: "1",
        name: name,
        par_rel: "0",
        rel_id: ["2", "1"]
      },
      {
        created: serverTimestamp(),
        gender: "f",
        id: "2",
        name: partner,
        par_rel: "0",
        rel_id: ["1", "2"]
      }
    ]

    const db = getFirestore()
    const batch = writeBatch(db)

    const processBatch = async () => {
      const promises = data.map(async (item) => {
        const docRef = doc(db, `genealogy/${famName}/member/${item.id}`)
        batch.set(docRef, item)
      });
      await Promise.all(promises)
      await batch.commit()
    }

    processBatch().then((result) => {
      Alert.alert("Berhasil menambahkan keluarga baru")
      setLoading(false)
      router.back()
    }).catch((er) => {
      setLoading(false)
      console.warn("warn", er)
    })
  }

  return (
    <ComponentsKeyboardAvoid style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ComponentHeader title="TAMBAH KELUARGA BARU" />

        <ScrollView keyboardShouldPersistTaps="handled">
          <LibInput
            ref={familyRef}
            placeholder="Nama Keluarga"
            autoCapitalize="words"
            keyboardType="default"
            onSubmitEditing={() => nameRef.current?.focus?.()}
            onChangeText={(t) => {
              setFamily(t)
            }}
          />
          <LibInput
            ref={nameRef}
            placeholder="Nama Kepala Keluarga"
            autoCapitalize="words"
            keyboardType="default"
            onSubmitEditing={() => partnerRef.current?.focus?.()}
            onChangeText={(t) => {
              setName(t)
            }}
          />
          <LibInput
            ref={partnerRef}
            placeholder="Nama Pasangan"
            autoCapitalize="words"
            keyboardType="default"
            onSubmitEditing={doSave}
            onChangeText={(t) => {
              setPartner(t)
            }}
          />
        </ScrollView>
        <ComponentButton
          title="SIMPAN"
          loading={loading}
          onPress={() => {
            doSave()
          }}
        />

      </View>
    </ComponentsKeyboardAvoid>
  )
}