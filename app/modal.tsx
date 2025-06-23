import { StyleSheet } from 'react-native';

import ComponentButton from '@/components/Button';
import { View } from '@/components/Themed';
import ComponentUpdate from '@/components/Update';
import { useClerk } from '@clerk/clerk-expo';
import { getAuth } from '@react-native-firebase/auth';
import * as Linking from 'expo-linking';
import userClass from './user/class';

export default function ModalScreen() {
  const { signOut } = useClerk()

  async function signOutGoogle() {
    await signOut()
    await getAuth().signOut()
  }

  return (
    <View style={styles.container}>
      <ComponentUpdate />
      <ComponentButton
        icons="arrow-forward"
        title="logout"
        onPress={() => {
          signOutGoogle().then(() => {
            userClass.delete()
            Linking.openURL(Linking.createURL('/'))
          })
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
