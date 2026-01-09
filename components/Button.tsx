import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";


export interface ComponentButtonProps {
  onPress?: () => void,
  title: string,
  textStyle?: any,
  icons?: string,
  iconColor?: string
  iconSize?: number,
  style?: any
  loading?: boolean,
  loadingColor?: string
}

export default function ComponentButton(props: ComponentButtonProps) {
  return (
    <TouchableOpacity
      disabled={props?.loading || false}
      onPress={props?.onPress}
      style={[{ backgroundColor: "#ec4e1e", marginHorizontal: 20, marginVertical: 10, borderRadius: 15, height: 48, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }, props?.style]}>
      {
        props?.loading ?
          <View>
            <ActivityIndicator color={props?.loadingColor || "#fff"} />
          </View>
          :
          <>
            <Text style={[{ marginRight: 5, fontFamily: 'Roboto-Medium', color: "white", fontSize: 18 }, props?.textStyle]} >{props?.title}</Text>
            {/* @ts-ignore */}
            <Ionicons name={props?.icons || "arrow-forward"} size={props?.iconSize || 20} color={props?.iconColor || "white"} />
          </>
      }
    </TouchableOpacity>);
}