import { StyleSheet } from 'react-native';

import ComponentButton from '@/components/Button';
import { View } from '@/components/Themed';
import ComponentUpdate from '@/components/Update';
import { getAuth } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import userClass from './user/class';

export default function ModalScreen() {
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

  return (
    <View style={styles.container}>
      <ComponentUpdate />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})
