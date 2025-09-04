import { Text, View } from "@/components/Themed";
import useStorage from "@/components/useStorage";
import LibInput, { LibInputRef } from "@/lib/input";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import moment from 'moment';
import { useRef, useState } from "react";
import { Dimensions, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { getData } from "./categories_add";

const EXIN_EXPENSE_KEY = "exinpockey-expenses";

export function getExpense() {
  const data = useStorage.getItemSync(EXIN_EXPENSE_KEY)

  let oldData: any[] = []
  try {
    if (data) {
      oldData = typeof data === "string" ? JSON.parse(data) : data
    }
  } catch (e) {
    console.warn("Failed to parse old data:", e)
    oldData = []
  }
  return oldData

}

export default function ExinAdd() {
  const { width } = Dimensions.get("window")
  const itemWidth = (width - 30) * 0.25
  const btnWidth = width * 0.25
  const inputRef = useRef<LibInputRef>(null)

  const data = getData()
  const initialOutput = '0';
  const [selected, setSelected] = useState<any>()
  const [output, setOutput] = useState<any>(initialOutput)
  const allTypes = [
    { label: "Expense", value: "expense" },
    { label: "Income", value: "income" }
  ]
  const [type, setType] = useState<string>(allTypes[0].value)

  function handleNumber(value: any) {
    if (output !== initialOutput) {
      setOutput((x: any) => x += value)
    }
    else {
      setOutput(value + '')
    }
  }

  function handleDelete() {
    if (output?.length == 1) {
      setOutput(initialOutput)
    } else {
      setOutput((x: any) => String(x).slice(0, -1))
    }
  }

  function handleAdd() {
    if (output?.includes?.("+")) {
      let count = output.split("+").reduce((a: number, b: number) => Number(a) + Number(b), 0)
      setOutput(() => count + "+")
    } else
      setOutput((x: any) => x += "+")
  }

  function handleSubmit() {
    if (String(output)?.includes?.("+")) {
      let count = output.split("+").reduce((a: number, b: number) => Number(a) + Number(b), 0)
      setOutput(count)
    } else {
      doSubmit()
    }

    // useStorage.removeItem(EXIN_EXPENSE_KEY)
  }

  function doSubmit() {
    if (!output) {
      return
    }

    const text = inputRef.current?.getText() != "" ? inputRef.current?.getText() : selected?.cat_label
    const post = {
      title: text,
      icon: selected?.cat_icon,
      color: selected?.cat_color,
      amount: output,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
      type
    }

    let oldData: any[] = getExpense()
    let newData = [...oldData, post]
    useStorage.setItem(EXIN_EXPENSE_KEY, JSON.stringify(newData))
  }

  const btns = [
    {
      type: "number",
      label: "7"
    },
    {
      type: "number",
      label: "8"
    },
    {
      type: "number",
      label: "9"
    },
    {
      type: "date",
      label: "Today"
    },
    {
      type: "number",
      label: "4"
    },
    {
      type: "number",
      label: "5"
    },
    {
      type: "number",
      label: "6"
    },
    {
      type: "addition",
      label: "+"
    },
    {
      type: "number",
      label: "1"
    },
    {
      type: "number",
      label: "2"
    },
    {
      type: "number",
      label: "3"
    },
    {
      type: "subtraction",
      label: "-"
    },
    {
      type: "fractional",
      label: "."
    },
    {
      type: "number",
      label: "0"
    },
    {
      type: "delete",
      label: "del"
    },
    {
      type: "submit",
      label: "done"
    },
  ]

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 15, marginHorizontal: 18 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={20} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text allowFontScaling={false} style={{ fontSize: 14, fontFamily: "Roboto-Regular" }} >{"Expenses"}</Text>
            <Ionicons name='chevron-down' size={18} style={{ marginLeft: 10 }} />
          </View>
        </View>
        <Pressable>
          <Ionicons name='notifications-outline' size={20} />
        </Pressable>
      </View>
      <ScrollView>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginHorizontal: 15 }}>
          {
            data && data.length > 0 && data?.map?.((item: any, index: number) => (
              <Pressable key={index}
                onPress={() => setSelected(item)}
                style={{ width: itemWidth, height: itemWidth, alignItems: "center", justifyContent: "center" }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: 20, backgroundColor: item?.cat_color }}>
                  <Ionicons name={item?.cat_icon} size={26} color={"#f3f3f3"} />
                </View>
                <Text allowFontScaling={false} style={{ fontSize: 10, fontFamily: "Roboto-Regular",marginTop: 5 }} >{item?.cat_label}</Text>
              </Pressable>
            ))
          }
          <Pressable onPress={() => {
            router.navigate("/exinpockey/categories_add")
          }} style={{ width: itemWidth, height: itemWidth, alignItems: "center", justifyContent: "center" }}>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: 20, backgroundColor: '#f2f2f2', borderWidth: 1, borderStyle: 'dashed' }}>
              <Ionicons name='add-outline' size={26} color={"#989898"} />
            </View>
            <Text allowFontScaling={false} style={{ fontSize: 10, fontFamily: "Roboto-Regular",marginTop: 5 }} >{"Add"}</Text>
          </Pressable>
        </View>
      </ScrollView>
      {
        selected &&
        <View style={{ backgroundColor: "#f1f1f1", borderTopWidth: 1, borderTopColor: "#e6e6e6" }}>
          <LibInput
            ref={inputRef}
            returnKeyType="next"
            autoCapitalize="none"
            placeholder="memo"
            icon={selected?.cat_icon}
            style={{
              flex: 1,
              fontFamily: "Roboto-Medium",
              fontSize: 12,
              color: "#000",
              marginRight: 10,
              marginLeft: 10,
              textAlign: "left"
            }}
            containerStyle={{
              marginTop: -8,
              backgroundColor: "#fff",
              borderWidth: 0,
              borderRadius: 0,
              marginHorizontal: 0,
              padding: 3, paddingHorizontal: 15,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            rightView={() =>
              <View style={{ position: 'absolute', right: 20 }}>
                <Text allowFontScaling={false} style={{ fontSize: 20, fontFamily: "Roboto-Medium" }}>{output}</Text>
              </View>
            }
            onSubmitEditing={() => { }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
            {
              btns.map((item: any, i: number) => {
                return (
                  <TouchableOpacity key={i}
                    onPress={() => {
                      if (item.type == "number") {
                        handleNumber(Number(item?.label))
                      } else if (item.type == "addition") {
                        handleAdd()
                      } else if (item.type == "delete") {
                        handleDelete()
                      } else {
                        handleSubmit()
                      }
                    }}
                    style={{ width: btnWidth, alignItems: "center", justifyContent: "center", height: 50, borderWidth: 1, borderColor: "#e6e6e6", backgroundColor: item.type == "submit" ? "orange" : "#fff" }}>
                    {
                      item.type == "date" ?
                        <>
                          <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: "Roboto-Regular" }}>{item.label}</Text>
                          <Text allowFontScaling={false} style={{ fontSize: 10, fontFamily: "Roboto-Regular" }}>{"18/8"}</Text>
                        </>
                        :
                        item.type == "submit" ?
                          <Ionicons name={(output?.includes?.("+") && !output?.split?.("+")?.includes?.("")) ? "reorder-two-outline" : "checkmark-circle-outline"} size={26} />
                          :
                          item.type == "delete" ?
                            <Ionicons name="backspace-outline" size={26} />
                            :
                            <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily: "Roboto-Regular" }}>{item.label}</Text>
                    }
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </View>
      }

    </View>
  )
}