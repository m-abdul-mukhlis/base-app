import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import ComponentButton from '@/components/Button';
import ComponentsKeyboardAvoid from '@/components/KeyboardAvoid';
import { Text, View } from '@/components/Themed';
import UseFirestore from '@/components/useFirestore';
import LibInput, { LibInputRef } from '@/lib/input';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, getAuth } from '@react-native-firebase/auth';
import { serverTimestamp } from '@react-native-firebase/firestore';
import React, { useState } from 'react';

export default function AuthRegisterScreen() {
  const nameRef = React.useRef<LibInputRef>(null)
  const emailRef = React.useRef<LibInputRef>(null)
  const passwordRef = React.useRef<LibInputRef>(null)
  const reinputPasswordRef = React.useRef<LibInputRef>(null)
  const [show, setShow] = useState<boolean>(false)
  const [showReinput, setShowReinput] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)

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

    createUserWithEmailAndPassword(getAuth(), email, password).then((data) => {
      const id = UseFirestore().generateId
      UseFirestore().addDocument(["genealogy", "genealogy", "users", id], {
        id: id,
        name: name,
        email: email,
        created: serverTimestamp(),
        lastLogin: serverTimestamp()
      }, () => {
        setLoading(false)
      }, (r) => console.warn("loh", r))
    }).catch(({ code, message }) => {
      setLoading(false)
      if (code == "auth/email-already-in-use") {
        Alert.alert("Oops!", "The email address is already in use by another account")
      }
      console.warn(message)
    })
  }

  return (
    <ComponentsKeyboardAvoid style={{ flex: 1 }}>
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
    </ComponentsKeyboardAvoid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
