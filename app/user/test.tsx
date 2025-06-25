import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import Crop from '../crop';

export default function UserTest() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!selectedImage && (
        <Button title="Pick an image" onPress={pickImage} />
      )}

      {selectedImage && !croppedImage && (
        <Crop
          imageUri={selectedImage}
          onDone={(uri: string) => {
            setCroppedImage(uri);
          }}
        />
      )}

      {croppedImage && (
        <View style={{ flex: 1 }}>
          <Image source={{ uri: croppedImage }} style={{ flex: 1, resizeMode: 'contain' }} />
        </View>
      )}
    </View>
  );
}
