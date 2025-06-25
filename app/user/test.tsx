import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Button, ScrollView, View } from 'react-native';
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
        <ScrollView>
          <Crop imageUri={image} onCrop={(uri) => setCropped(uri)} />
        </ScrollView>
      ) : (
        <>
          <Button title="Pick Image" onPress={pick} />
          {cropped && <Image source={{ uri: cropped }} style={{ width: 500, height: 500 }} contentFit='contain' />}
        </>
      )}
    </View>
  );
}
