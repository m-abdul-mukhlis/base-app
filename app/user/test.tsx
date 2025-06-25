import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import Crop from '../crop';

export default function UserTest() {
  const [image, setImage] = useState<string | null>(null);
  const [cropped, setCropped] = useState<string | null>(null);

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images' });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
      setCropped(null);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {image && !cropped ? (
        <Crop imageUri={image} onCrop={(uri) => setCropped(uri)} />
      ) : (
        <>
          <Button title="Pick Image" onPress={pick} />
          {cropped && <Image source={{ uri: cropped }} style={{ width: 200, height: 200 }} />}
        </>
      )}
    </View>
  );
}
