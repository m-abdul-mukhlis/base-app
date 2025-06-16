import ComponentButton from '@/components/Button';
import { Text, View } from '@/components/Themed';
import ComponentUpdate from '@/components/Update';
import LibInput, { LibInputRef } from '@/lib/input';
import { Ionicons } from "@expo/vector-icons";
import { GoogleAuthProvider, getAuth, linkWithCredential, signInWithCredential, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, TouchableOpacity } from 'react-native';


export default function AuthLoginScreen() {
  const [show, setShow] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const emailRef = React.useRef<LibInputRef>(null)
  const passwordRef = React.useRef<LibInputRef>(null)

  // async function signInWithGoogle() {
  //   let idToken
  //   await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  //   await GoogleSignin.signOut()
  //   const signInResult = await GoogleSignin.signIn()

  //   idToken = signInResult.data?.idToken
  //   if (!idToken) {
  //     throw new Error('No ID token found');
  //   }
  //   const googleCredential = GoogleAuthProvider.credential(idToken);
  //   const user = getAuth().currentUser
  //   if (!!user) {
  //     linkWithCredential(user, googleCredential)
  //   }
  //   return signInWithCredential(getAuth(), googleCredential);
  // }

  async function signInWithGoogle() {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signOut(); // Optional: only if you want a clean sign-in

    const { data } = await GoogleSignin.signIn();
    const idToken = data?.idToken
    if (!idToken) throw new Error('No ID token found');

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const user = getAuth().currentUser;

    if (!!user) {
      try {
        await linkWithCredential(user, googleCredential);
        console.log("✅ Google account linked");
      } catch (e: any) {
        if (e.code === 'auth/credential-already-in-use') {
          console.warn("⚠️ Google already linked to another account.");
          // You might choose to sign in instead:
          await signInWithCredential(getAuth(), googleCredential);
        } else {
          console.error(e.message);
        }
      }
    } else {
      await signInWithCredential(getAuth(), googleCredential);
    }
  }


  function signInWithEmail() {
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

    signInWithEmailAndPassword(getAuth(), email, password).then((e) => {
      setLoading(false)
    }).catch(({ code, message }) => {
      setLoading(false)
      console.warn(message)
      Alert.alert("Oops", message)
    })
  }

  return (
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

        <View style={{ marginVertical: 30 }}>
          <Text allowFontScaling={false} style={{ fontFamily: "Roboto-Medium", fontSize: 14, textAlign: "center", color: "#ec4e1e", marginBottom: 10 }} >{"or continue with"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10 }}>
            <TouchableOpacity onPress={() => {
              signInWithGoogle()
            }} style={{ backgroundColor: "#f1f1f1", borderRadius: 10, padding: 15, marginHorizontal: 5 }}>
              <Ionicons name="logo-google" color={"#121111"} size={18} />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => { }} style={{ backgroundColor: "#f1f1f1", borderRadius: 10, padding: 15, marginHorizontal: 5 }}>
              <Ionicons name="logo-apple" color={"#121111"} size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { }} style={{ backgroundColor: "#f1f1f1", borderRadius: 10, padding: 15, marginHorizontal: 5 }}>
              <Ionicons name="logo-facebook" color={"#121111"} size={18} />
            </TouchableOpacity> */}
          </View>
        </View>
        <ComponentUpdate />
      </ScrollView>

    </View>
  )
}