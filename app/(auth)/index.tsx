import ComponentButton from '@/components/Button';
import ComponentsKeyboardAvoid from '@/components/KeyboardAvoid';
import { Text, View } from '@/components/Themed';
import ComponentUpdate from '@/components/Update';
import LibInput, { LibInputRef } from '@/lib/input';
import { useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, TouchableOpacity } from 'react-native';


export default function AuthLoginScreen() {
  const [show, setShow] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const emailRef = React.useRef<LibInputRef>(null)
  const passwordRef = React.useRef<LibInputRef>(null)

  const { signIn, setActive, isLoaded } = useSignIn()

  function signInWithEmail() {
    emailRef.current?.setText("mukhlis.esoftplay@gmail.com")
    // passwordRef.current?.setText("123456")
    passwordRef.current?.setText("Mukhlis123.")

    if (emailRef.current?.getText() == "") {
      emailRef.current?.setError?.("Please input your email")
      return
    }
    let reg = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/;
    if (reg.test(emailRef.current?.getText?.() || "") == false) {
      emailRef?.current?.setError?.("Email not valid, please reinput your email")
      return
    }
    if (passwordRef.current?.getText() == "") {
      passwordRef.current?.setError?.("Please input your password")
      return
    }
    setLoading(true)
    const email = emailRef.current?.getText().trim().toLocaleLowerCase() || ""
    const password = passwordRef.current?.getText().trim() || ""

    onSignInPress(email, password)
  }

  const onSignInPress = async (email: string, password: string) => {
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/user')
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <ComponentsKeyboardAvoid>

      <View style={{ flex: 1 }}>
        <ScrollView>

          <View style={{ marginTop: 60, marginBottom: 50 }}>
            <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 24, textAlign: "center", color: "#ec4e1e" }} >{"Login here"}</Text>
            <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 18, textAlign: "center", color: "#121111", marginTop: 20 }} >{"Welcome back\nyou've been missed!"}</Text>
          </View>

          <LibInput
            ref={emailRef}
            icon="mail-outline"
            returnKeyType="next"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email..."
            onSubmitEditing={() => passwordRef.current?.focus?.()}
          />
          <LibInput
            ref={passwordRef}
            icon="lock-closed-outline"
            returnKeyType="done"
            autoCapitalize="none"
            placeholder="Password..."
            secureTextEntry={!show}
            onSubmitEditing={() => { signInWithEmail() }}
            rightView={() =>
              <Pressable onPress={() => setShow(!show)} style={{ position: 'absolute', right: 20 }}>
                <Ionicons name={show ? "eye-off-outline" : 'eye-outline'} size={18} />
              </Pressable>
            }
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginHorizontal: 20, marginVertical: 10 }}>
            <TouchableOpacity onPress={() => {
              console.log("forgot password")
            }} >
              <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 14, textAlign: "right", color: "#ec4e1e" }} >{"forgot your password?"}</Text>
            </TouchableOpacity>
          </View>

          <ComponentButton
            icons="arrow-forward"
            title="Sign in"
            loading={loading}
            onPress={() => {
              signInWithEmail()
            }}
          />

          <TouchableOpacity onPress={() => { router.navigate('/(auth)/register') }} style={{ marginVertical: 30 }}>
            <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 14, textAlign: "center", color: "#7f7f7f" }} >{"create new account"}</Text>
          </TouchableOpacity>

          <ComponentUpdate />
        </ScrollView>

      </View>
    </ComponentsKeyboardAvoid>
  )
}