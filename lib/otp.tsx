import { Text } from '@/components/Themed';
import React, { useEffect, useRef, useState } from 'react';
import { TextInput, View, ViewStyle } from 'react-native';

export interface LibOtpProps {
  length: number,
  onChangePin: (pin: string) => void
  boxStyle?: ViewStyle,
  pinValue?: string,
  pinStyle?: ViewStyle
}
export default function m(props: LibOtpProps): any {
  const [otp, setOtp] = useState<string[]>([])
  const input = useRef<TextInput>(null)

  useEffect(() => {
    const timer = setTimeout(() => { input?.current?.focus(); clearTimeout(timer) }, 100);
    setOtp(props?.pinValue?.split?.(''))
    props.onChangePin(props?.pinValue || '')
  }, [props.pinValue])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
      {
        new Array(props.length).fill('').map((_, i) => (
          <View key={i} style={{ height: 40, width: 40, margin: 5, borderRadius: 4, borderWidth: 0.5, borderColor: '#444', ...props.boxStyle, alignItems: 'center', justifyContent: 'center' }}>
            {!!otp?.[i] && <Text allowFontScaling={false} style={{ fontFamily: 'Roboto-Medium', fontSize: 28, color: '#ec4e1e', opacity: 0.8 }}>{otp?.[i]}</Text>}
          </View>
        ))
      }
    </View>
  )
}