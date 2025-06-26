import { RefreshControl, ScrollView } from "react-native";

export interface ComponentScrollProps {
  onRefresh?: () => void
  children?: any
}

export default function ComponentScroll(props: ComponentScrollProps) {

  return (
    <ScrollView
      scrollEventThrottle={64}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={props?.onRefresh && <RefreshControl refreshing={false} onRefresh={props?.onRefresh} />}>
      {props?.children}
    </ScrollView>
  )
}