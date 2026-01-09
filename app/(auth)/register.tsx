import { Alert, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions } from 'react-native';

import ComponentButton from '@/components/Button';
import ComponentsKeyboardAvoid from '@/components/KeyboardAvoid';
import { Text, View } from '@/components/Themed';
import UseFirestore from '@/components/useFirestore';
import LibInput, { LibInputRef } from '@/lib/input';
import LibOtp from '@/lib/otp';
import { useSignUp } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createUserWithEmailAndPassword, getAuth } from '@react-native-firebase/auth';
import { serverTimestamp } from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React, { useState } from 'react';

export default function AuthRegisterScreen() {
  const nameRef = React.useRef<LibInputRef>(null)
  const emailRef = React.useRef<LibInputRef>(null)
  const passwordRef = React.useRef<LibInputRef>(null)
  const reinputPasswordRef = React.useRef<LibInputRef>(null)
  const [show, setShow] = useState<boolean>(false)
  const [showReinput, setShowReinput] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const { isLoaded, signUp, setActive } = useSignUp()
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const { width } = useWindowDimensions()
  const itemWidth = (width - 90) / 6

  async function onRegisterPress() {
    if (nameRef.current?.getText() == "") {
      nameRef.current?.setError?.("Please input your name")
      return
    }
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
    if (reinputPasswordRef.current?.getText() == "") {
      reinputPasswordRef.current?.setError?.("Please input your password")
      return
    }
    if (passwordRef.current?.getText() != reinputPasswordRef.current?.getText()) {
      passwordRef.current?.setError?.("Password not same, please reinput your password")
      reinputPasswordRef.current?.setError?.("Password not same, please reinput your password")
      return
    }

    setLoading(true)
    const name = nameRef.current?.getText().trim() || ""
    const email = emailRef.current?.getText().trim().toLocaleLowerCase() || ""
    const password = passwordRef.current?.getText().trim() || ""

    onSignUpPress(name, email, password)
  }

  const onSignUpPress = async (name: string, email: string, password: string) => {
    if (!isLoaded) return

    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      const instance: any = UseFirestore().instance()
      createUserWithEmailAndPassword(getAuth(instance), email, password).then((data) => {
        const id = UseFirestore().generateId
        UseFirestore().addDocument(instance, ["genealogy", "genealogy", "users", id], {
          id: id,
          name: name,
          email: email,
          password: password,
          created: serverTimestamp(),
          lastLogin: serverTimestamp()
        }, () => {
          setLoading(false)
          setPendingVerification(true)
        }, (r) => console.warn("loh", r))
      }).catch(({ code, message }) => {
        setLoading(false)
        if (code == "auth/email-already-in-use") {
          Alert.alert("Oops!", "The email address is already in use by another account")
        }
        console.warn("error", message)
      })
    } catch (err: any) {
      setLoading(false)
      Alert.alert("Terjadi Kesalahan", err?.message)
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return
    if (code.length < 6) {
      Alert.alert("Oops!", "Please input your verification code")
      return
    }
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/user')
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <ComponentsKeyboardAvoid style={{ flex: 1 }}>
      {
        pendingVerification ?
          <View style={styles.container}>
            <View style={{ marginTop: 60, marginBottom: 50 }}>
              <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 24, textAlign: "center", color: "#ec4e1e" }} >{"Verify your email"}</Text>
              <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 18, textAlign: "center", color: "#121111", marginTop: 20 }} >{"Verification code has been\n sent to your email"}</Text>
            </View>
            <TextInput
              value={code}
              style={{ width: 0, height: 0 }}
              placeholder="Enter your verification code"
              onChangeText={(code) => setCode(code)}
            />
            <LibOtp
              length={6}
              pinValue={code}
              boxStyle={{ borderColor: '#ec4e1e', borderWidth: 1, backgroundColor: '#fff', width: itemWidth, height: itemWidth, borderRadius: 8, marginVertical: 10 }}
              onChangePin={(p) => {
                if (p.length == 6) {
                  setCode(p)
                }
              }}
            />
            <ComponentButton
              title='Verify'
              onPress={onVerifyPress}
            />
          </View>
          :
          <View style={styles.container}>
            <ScrollView>

              <View style={{ marginTop: 60, marginBottom: 50 }}>
                <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 24, textAlign: "center", color: "#ec4e1e" }} >{"Register here"}</Text>
                <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 18, textAlign: "center", color: "#121111", marginTop: 20 }} >{"Please Register to \nuse our app features"}</Text>
              </View>

              <LibInput
                ref={nameRef}
                icon="person-outline"
                returnKeyType="next"
                autoCapitalize="none"
                placeholder="Name..."
                onSubmitEditing={() => emailRef.current?.focus?.()}
              />
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
                onSubmitEditing={() => reinputPasswordRef.current?.focus?.()}
                rightView={() =>
                  <Pressable onPress={() => setShow(!show)} style={{ position: 'absolute', right: 20 }}>
                    <Ionicons name={show ? "eye-off-outline" : 'eye-outline'} size={18} />
                  </Pressable>
                }
              />
              <LibInput
                ref={reinputPasswordRef}
                icon="lock-closed-outline"
                returnKeyType="done"
                autoCapitalize="none"
                placeholder="Reinput password..."
                secureTextEntry={!showReinput}
                onSubmitEditing={() => { onRegisterPress() }}
                rightView={() =>
                  <Pressable onPress={() => setShowReinput(!showReinput)} style={{ position: 'absolute', right: 20 }}>
                    <Ionicons name={showReinput ? "eye-off-outline" : 'eye-outline'} size={18} />
                  </Pressable>
                }
              />

            </ScrollView>
            <ComponentButton
              icons="arrow-forward"
              title="Register"
              loading={loading}
              onPress={() => {
                onRegisterPress()
              }}
            />

          </View>
      }
    </ComponentsKeyboardAvoid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
