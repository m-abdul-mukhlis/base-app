import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const libImage = {
  fromCamera(options?: { maxDimension?: number }): Promise<string> {
    return new Promise((_r) => {
      const timer = setTimeout(async () => {
        const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
        var finalStatus = cameraPermission.status
        if (finalStatus !== 'granted') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          finalStatus = status
        }
        if (finalStatus === 'granted') {
          const rollPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
          finalStatus = rollPermission.status
          if (finalStatus !== 'granted') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            finalStatus = status
          }
        }
        if (finalStatus != 'granted') {
          Alert.alert("App does not have permission to access the camera or photo library. Please enable it in the app settings.");
        }
        ImagePicker.launchCameraAsync({
          quality: 1,
          presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN
        }).then(async (res: any) => {
          if (!res)
            res = ImagePicker?.getPendingResultAsync?.()
          if (!res?.cancelled) {
            let result: any = undefined
            let hasUri = res?.uri
            if (hasUri) {
              result = res
            } else if (res?.assets?.[0]) {
              result = { ...res, ...res.assets[0] }
            }
            let imageUri = await this.processImage(result, options?.maxDimension)
            _r(imageUri)
          }
        })
        clearTimeout(timer)
      }, 1);
    })
  },
  fromGallery(options?: { maxDimension?: number }): Promise<string | string[]> {
    return new Promise((_r) => {
      const timer = setTimeout(async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        var finalStatus = status
        if (finalStatus !== 'granted') {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          finalStatus = status
        }
        if (finalStatus != 'granted') {
          Alert.alert("App does not have permission to access the camera or photo library. Please enable it in the app settings.");
          return
        }
        ImagePicker.launchImageLibraryAsync({
          presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
          quality: 1,
        }).then(async (z: any) => {
          if (!z.cancelled) {
            let x: any = undefined
            let hasUri = z?.uri
            if (hasUri) {
              x = z
            } else if (z?.assets?.[0]) {
              x = { ...z, ...z.assets[0] }
            }
            let imageUri = await this.processImage(x, options?.maxDimension)
            _r(imageUri)
          }
        })
        clearTimeout(timer)
      }, 1)
    })
  },
  processImage(result: any, maxDimension?: number): Promise<string> {
    return new Promise((r) => {
      const timer = setTimeout(async () => {

        const formData = new FormData();
        formData.append('image', {
          uri: result?.uri,
          name: 'image.jpg',
          type: 'image/jpeg'
        });

        const response = await fetch("https://base-app-backend-production.up.railway.app/upload", {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const json = await response.json();
        r(json.url)

        clearTimeout(timer)
      }, 1);
    })
  }
}

export default libImage;