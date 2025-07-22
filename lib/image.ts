import curl from '@/components/curl';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { navigateWithResult } from './navigation';
import LibProgress from './progress';

const openCroppper = (image: string, forceCrop: boolean, ratio: string, result: (data: any) => void) => {
  navigateWithResult(router, "/crop", { image, forceCrop, ratio }).then(result)
};

const libImage = {
  async fromCamera(options?: {
    crop: {
      ratio: string,
      forceCrop: boolean,
      message?: string
    }, maxDimension?: number
  }): Promise<string> {
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
        if (options?.crop) {
          const imageCropURI: string = await new Promise((resolve) => {
            openCroppper(
              result.assets[0].uri,
              options.crop.forceCrop,
              options.crop.ratio,
              async (data) => {
                const imageURI = await this.processImage({ uri: data?.uri }, options?.maxDimension);
                resolve(imageURI)
              }
            );
          });
          return imageCropURI
        } else {
          return await this.processImage(result.assets[0], options?.maxDimension);
        }
      }

      return "";
    } catch (error: any) {
      Alert.alert("Camera Error", error.message);
      return "";
    }
  },

  async fromGallery(options?: {
    crop: {
      ratio: string,
      forceCrop: boolean,
      message?: string
    }, maxDimension?: number
  }): Promise<string> {
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
        if (options?.crop) {
          const imageCropURI: string = await new Promise((resolve) => {
            openCroppper(
              result.assets[0].uri,
              options.crop.forceCrop,
              options.crop.ratio,
              async (data) => {
                const imageURI = await this.processImage({ uri: data?.uri }, options?.maxDimension);
                resolve(imageURI)
              }
            );
          });
          return imageCropURI
        } else {
          return await this.processImage(result.assets[0], options?.maxDimension);
        }
      }

      return "";
    } catch (error: any) {
      Alert.alert("Gallery Error", error.message);
      return "";
    }
  },

  async processImage(result: any, maxDimension?: number): Promise<string> {
    // const URL = "https://base-app-backend-production.up.railway.app/upload"
    const URL = "https://bengal-powerful-readily.ngrok-free.app/upload"
    try {
      const url = await new Promise<string>((resolve, reject) => {
        LibProgress.show()
        curl.upload(URL, { uri: result?.uri },
          (res: any) => {
            LibProgress.hide()
            resolve(res?.url || "");
          },
          (error: any) => {
            LibProgress.hide()
            reject(new Error("Upload failed"));
          }
        );
      });

      return url;
    } catch (err: any) {
      LibProgress.hide()
      Alert.alert("Upload failed", err.message);
      return "";
    }
  },
};

export default libImage;
