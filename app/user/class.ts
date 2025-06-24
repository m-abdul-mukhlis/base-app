import UseFirestore from "@/components/useFirestore";
import useStorage from "@/components/useStorage";
import libNotification from "@/lib/notification";
import { serverTimestamp } from "@react-native-firebase/firestore";
import Constants from 'expo-constants';
import { Platform } from "react-native";

const userClass = {
  set(data: any) {
    useStorage.setItem("user-class", JSON.stringify(data))
  },
  get() {
    const data = useStorage.getItemSync("user-class")
    return data ? typeof data == "string" ? JSON.parse(data) : data : null
  },
  delete() {
    useStorage.removeItem("user-class")
    this.pushToken()
  },
  sendToken(token: string) {
    console.log("send token", userClass?.get?.())
    UseFirestore().getCollectionWhere(["genealogy", "genealogy", "token"], [["username", "==", userClass?.get?.()?.email]], (data) => {
      console.log({ data })
      if (data.length > 0) {
        const id = data?.[0]?.id
        UseFirestore().updateDocument(["genealogy", "genealogy", "token", String(id)], [
          { key: "token", value: String(token) },
          { key: "updated", value: serverTimestamp() }
        ], () => {
          useStorage.setItem("token", token)
        })
      } else
        UseFirestore().addCollection(["genealogy", "genealogy", "token"], {
          username: userClass?.get?.()?.email || null,
          device: Constants.deviceName,
          os: Platform.OS,
          created: serverTimestamp(),
          updated: serverTimestamp(),
          token: String(token)
        }, () => {
          useStorage.setItem("token", token)
        })
    })
  },
  pushToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      libNotification?.requestPermission?.((token) => {
        resolve(this.sendToken(token))
      })
    })
  }
}

export default userClass