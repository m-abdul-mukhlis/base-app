import Constants from 'expo-constants';
import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export interface KeyboadAvoidProps {
  children?: any,
  style?: ViewStyle
}

export default function ComponentsKeyboardAvoid(props: KeyboadAvoidProps): any {
  return (
    <KeyboardAvoidingView keyboardVerticalOffset={Constants.statusBarHeight}  behavior={Platform.OS == 'android' ? 'height' : 'padding'} style={[{ flex: 1 }, props.style]} >
      {props.children}
    </KeyboardAvoidingView>
  )
}

