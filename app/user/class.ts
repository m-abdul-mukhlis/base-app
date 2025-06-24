import UseFirestore from "@/components/useFirestore";
import useStorage from "@/components/useStorage";
import libNotification from "@/lib/notification";
import { serverTimestamp } from "@react-native-firebase/firestore";
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
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
    if (userClass.get?.()?.email) {
      UseFirestore().getCollectionWhere(["genealogy", "genealogy", "token"], [["username", "==", userClass?.get?.()?.email]], (data) => {
        if (data.length > 0) {
          const item = data?.[0]
          const id = item.id

          if (item?.device == Constants?.deviceName) {
            UseFirestore().updateDocument(["genealogy", "genealogy", "token", String(id)], [
              { key: "token", value: String(token) },
              { key: "updated", value: serverTimestamp() }
            ], () => {
              useStorage.setItem("token", token)
            })
          } else {
            addNewRecords()
          }
        } else
          addNewRecords()
      })
    }

    async function addNewRecords() {
      const post = {
        username: userClass?.get?.()?.email || null,
        device: Constants.deviceName,
        os: Platform.OS,
        created: serverTimestamp(),
        updated: serverTimestamp(),
        token: String(token),
        installationId: await getInstallationID()
      }

      UseFirestore().addCollection(["genealogy", "genealogy", "token"], post, () => {
        useStorage.setItem("token", token)
      })
    }
  },
  pushToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      libNotification?.requestPermission?.((token) => {
        resolve(this.sendToken(token))
      })
    })
  }
}

function getInstallationID(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let out = useStorage.getItemSync("installationId")
    if (!out) {
      if (Platform.OS == "android")
        resolve(String(Application.androidId || Application.getAndroidId()))
      if (Platform.OS == "ios") {
        let code = await SecureStore.getItemAsync('installationId');
        if (!code) {
          code = ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          }))
        }
        useStorage.setItem("installationId", String(code));
        SecureStore.setItemAsync('installationId', String(code));
        resolve(code);
      }
    }
    resolve(out)
  })
}

export default userClass