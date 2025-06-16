import useStorage from "@/components/useStorage"

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
  }
}

export default userClass