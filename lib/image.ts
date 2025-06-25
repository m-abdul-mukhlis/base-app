import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const libImage = {
  async fromCamera(options?: { maxDimension?: number }): Promise<string> {
    try {
      let { status } = await ImagePicker.getCameraPermissionsAsync();
      if (status !== 'granted') {
        ({ status } = await ImagePicker.requestCameraPermissionsAsync());
      }
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Camera access is required.");
        return "";
      }

      let mediaStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (mediaStatus.status !== 'granted') {
        ({ status } = await ImagePicker.requestMediaLibraryPermissionsAsync());
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "Media Library access is required.");
          return "";
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (result?.assets?.[0]) {
        return await libImage.processImage(result.assets[0], options?.maxDimension);
      }

      return "";
    } catch (error: any) {
      Alert.alert("Camera Error", error.message);
      return "";
    }
  },

  async fromGallery(options?: { maxDimension?: number }): Promise<string> {
    try {
      let { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        ({ status } = await ImagePicker.requestMediaLibraryPermissionsAsync());
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "Media Library access is required.");
          return "";
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 1,
        allowsEditing: false,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (result?.assets?.[0]) {
        return await libImage.processImage(result.assets[0], options?.maxDimension);
      }

      return "";
    } catch (error: any) {
      Alert.alert("Gallery Error", error.message);
      return "";
    }
  },

  async processImage(result: any, maxDimension?: number): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: result.uri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(process.env.UPLOAD_IMAGE_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const json = await response.json();
      return json.url;
    } catch (err: any) {
      Alert.alert("Upload failed", err.message);
      return "";
    }
  },
};

export default libImage;
