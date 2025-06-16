import ComponentButton from "@/components/Button";
import { Text, View } from "@/components/Themed";
import ComponentUpdate from "@/components/Update";
import { getAuth, GoogleAuthProvider, linkWithCredential } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { Alert, ScrollView } from "react-native";
import userClass from "./class";

export default function UserIndex() {
  const userData = userClass.get()

  async function signOutGoogle() {
    userClass.delete()
    try {
      await GoogleSignin.revokeAccess()
    } catch (error) {
      console.warn(1, error)
    }
    try {
      await GoogleSignin.signOut()
    } catch (error) {
      console.warn(2, error)
    }
    try {
      await getAuth().signOut()
    } catch (error) {
      console.warn(3, error)
    }
  }

  const linkGoogleAccount = async () => {
    try {
      const user = getAuth().currentUser;
      const { data } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(data?.idToken);
      if (user)
        await linkWithCredential(user, credential);
    } catch (error) {
      Alert.alert("Oops", JSON.stringify(error))
    }
  }


  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <Text>Hello {userData?.displayName}</Text>
        <Text>{userData?.email}</Text>
        <Image source={{ uri: userData?.photoURL }} style={{ width: 50, height: 50 }} />
        <ComponentUpdate />
      </ScrollView>
      <ComponentButton
        icons="arrow-forward"
        title="link google"
        onPress={() => {
          linkGoogleAccount()
        }}
      />
      <ComponentButton
        icons="arrow-forward"
        title="logout"
        onPress={() => {
          signOutGoogle()
        }}
      />
    </View>
  )
}