import Constants from 'expo-constants'
import * as Updates from 'expo-updates'
import { Alert, TouchableOpacity } from "react-native"
import { Text } from "./Themed"
import { createTimeout } from "./useTImeout"

export default function ComponentUpdate() {
  return (
    <TouchableOpacity style={{ marginVertical: 30, alignItems: "center" }} onPress={() => {
      function install(): void {
        const timeout = createTimeout()
        timeout.set(() => {
          Updates?.reloadAsync?.()
          timeout.clear()
        }, 100)

      }

      function check(callback?: (isNew: boolean) => void): void {
        if (__DEV__) {
          callback?.(false)
          return
        }
        Updates.checkForUpdateAsync().then(({ isAvailable }) => {
          if (!isAvailable) {
            callback?.(false)
          } else {
            Updates.fetchUpdateAsync()
              .then(({ isNew }) => {
                if (isNew && callback)
                  callback?.(isNew)
              }).catch((e) => {
                Alert.alert("Update Gagal", e)
              })
          }
        })
      }

      console.log("check update")

      if (!__DEV__) {
        // LibProgress.show(esp.lang("user/login", "check_update"))
        console.log("updated")
      }
      let timeout: any = setTimeout(() => {
        // LibProgress.hide()
        console.log("hide")
      }, 100000)

      check((isNew) => {
        if (isNew) {
          if (timeout) {
            clearTimeout(timeout)
            timeout = undefined
          }
          // LibProgress.hide()
          install()
        } else {
          if (timeout) {
            clearTimeout(timeout)
            timeout = undefined
          }
          // LibProgress.hide()
          // LibToastProperty.show(esp.lang("user/login", "app_new"))
        }
      })

    }}>
      <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Regular", fontSize: 12, color: "#7f7f7f" }}>{Constants.expoConfig?.slug} v{Constants.expoConfig?.version}-{Constants.expoConfig?.extra?.publish_id}</Text>
    </TouchableOpacity>
  )
}