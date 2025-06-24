import UseFirestore from "@/components/useFirestore"
import useStorage from "@/components/useStorage"
import libNotification from "@/lib/notification"

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
  },
  sendToken(token: string) {
    UseFirestore().addCollection(["genealogy", "genealogy", "token"], { token: String(token) }, () => {
      useStorage.setItem("token", token)
    })
  },
  pushToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      libNotification.requestPermission(async (token) => {
        resolve(await this.sendToken(token))
      })
    })
  }
}

export default userClass