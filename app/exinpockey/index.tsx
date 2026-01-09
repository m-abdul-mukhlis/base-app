import { Text, View } from '@/components/Themed';
import Utils from '@/constants/Utils';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import moment from 'moment';
import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import { getExpense } from './add';

function groupByDate(items: any) {
  const grouped: Record<
    string,
    { totalIncome: number; totalExpense: number; items: any }
  > = {}

  items.forEach((item: any) => {
    const dateKey = item.date.split(" ")[0] // only YYYY-MM-DD
    const amountNum = parseFloat(item.amount)

    if (!grouped[dateKey]) {
      grouped[dateKey] = { totalIncome: 0, totalExpense: 0, items: [] }
    }

    if (item.type === "income") {
      grouped[dateKey].totalIncome += amountNum
    } else {
      grouped[dateKey].totalExpense += amountNum
    }

    grouped[dateKey].items.push(item)
  })

  return Object.entries(grouped).map(([date, { totalIncome, totalExpense, items }]) => ({
    date,
    totalIncome,
    totalExpense,
    items,
  }))
}
export default function ExinIndex() {
  const datas = groupByDate(getExpense())

  return (
    <View style={{ flex: 1 }}>
      {/* Header UI (unchanged) */}
      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 15, marginHorizontal: 18 }}>
        <Ionicons name='menu' size={20} />
        <View style={{ flex: 1, alignItems: "center" }}>
          {/* <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: "bold" }} >{"$ 32,500.00"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          <Text allowFontScaling={false} style={{ fontSize: 12 }} >{"Total Balance"}</Text>
          <Ionicons name='chevron-down' size={14} style={{ marginLeft: 5 }} />
          </View> */}
        </View>
        <Pressable>
          <Ionicons name='notifications-outline' size={20} />
        </Pressable>
      </View>

      <ScrollView>
        <View style={{ marginTop: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 15, marginHorizontal: 15, padding: 15 }}>
          <View style={{ alignItems: 'center', justifyContent: "center" }}>
            <Text allowFontScaling={false} style={{ fontSize: 14, fontFamily: "Roboto-Light" }} >{"Income"}</Text>
            <Text allowFontScaling={false} style={{ marginTop: 5, fontSize: 18, fontFamily: "Roboto-Medium" }} >{"0"}</Text>
          </View>
          <View style={{ alignItems: 'center', justifyContent: "center", borderColor: "#e6e6e6", borderRightWidth: 1, borderLeftWidth: 1, paddingHorizontal: 30 }}>
            <Text allowFontScaling={false} style={{ fontSize: 14, fontFamily: "Roboto-Light" }} >{"Expense"}</Text>
            <Text allowFontScaling={false} style={{ marginTop: 5, fontSize: 18, fontFamily: "Roboto-Medium" }} >{"0"}</Text>
          </View>
          <View style={{ alignItems: 'center', justifyContent: "center" }}>
            <Text allowFontScaling={false} style={{ fontSize: 14, fontFamily: "Roboto-Light" }} >{"Balance"}</Text>
            <Text allowFontScaling={false} style={{ marginTop: 5, fontSize: 18, fontFamily: "Roboto-Medium" }} >{"0"}</Text>
          </View>
        </View>

        {
          datas && datas.length > 0 && datas.map?.((item: any, index: number) => (
            <View key={index} style={{ marginTop: 15, borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 15, marginHorizontal: 15, overflow: 'hidden' }}>
              <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e6e6e6", paddingHorizontal: 15, paddingVertical: 8 }}>
                <Text allowFontScaling={false} style={{ fontSize: 10, fontFamily: "Roboto-Regular", flex: 1 }}>{moment(item?.date).format("YYYY/MM/DD dddd")}</Text>
                {
                  item?.totalIncome != 0 &&
                  <Text allowFontScaling={false} style={{ fontSize: 10, fontFamily: "Roboto-Regular", marginRight: 5 }}>{"Income "}{Utils.money(item?.totalIncome)}</Text>
                }
                {
                  item?.totalExpense != 0 &&
                  <Text allowFontScaling={false} style={{ fontSize: 10, fontFamily: "Roboto-Regular" }}>{"Expense "}{Utils.money(item?.totalExpense)}</Text>
                }
              </View>
              {
                item?.items && item?.items?.length > 0 && item?.items?.map?.((item: any, index: number) => (
                  <View key={index} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginTop: 15 }}>
                    <View style={{ marginRight: 10, alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 15, backgroundColor: item?.color || '#e6e6e6' }}>
                      <Ionicons name={item?.icon} size={20} color={"white"} />
                    </View>
                    <Text allowFontScaling={false} style={{ flex: 1, fontSize: 12, fontFamily: "Roboto-Regular" }}>{Utils.ucwords(item?.title)}</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: "Roboto-Medium" }}>{item?.type == "expense" ? "-" : ""}{Utils.money(item?.amount)}</Text>
                  </View>
                ))
              }
              <View style={{ height: 10 }} />
            </View>
          ))
        }
      </ScrollView>

      <View style={{ position: "absolute", right: 20, bottom: 50 }}>
        <Pressable onPress={() => {
          router.navigate("/exinpockey/add")
        }} style={{ alignItems: 'center', justifyContent: 'center', width: 50, height: 50, borderRadius: 25, backgroundColor: '#e6e6e6' }}>
          <Ionicons name='add' size={30} />
        </Pressable>
      </View>

    </View>
  );
}
