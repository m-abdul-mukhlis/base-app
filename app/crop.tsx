import * as ImageManipulator from 'expo-image-manipulator';
import React, { useRef, useState } from 'react';
import { Button, Dimensions, Image, PanResponder, StyleSheet, View } from 'react-native';

const window = Dimensions.get('window');

export default function Crop({ imageUri, onCrop }: { imageUri: string, onCrop: (uri: string) => void }) {
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, size: 200 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setCropBox(prev => ({
          ...prev,
          x: Math.max(0, Math.min(window.width - prev.size, prev.x + gesture.dx)),
          y: Math.max(0, Math.min(window.height - prev.size, prev.y + gesture.dy)),
        }));
      },
    })
  ).current;

  const handleCrop = async () => {
    const cropArea = {
      originX: cropBox.x,
      originY: cropBox.y,
      width: cropBox.size,
      height: cropBox.size,
    };

    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ crop: cropArea }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    onCrop(result.uri);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

      {/* Crop box */}
      <View
        {...panResponder.panHandlers}
        style={[
          styles.cropBox,
          {
            left: cropBox.x,
            top: cropBox.y,
            width: cropBox.size,
            height: cropBox.size,
          },
        ]}
      />

      <Button title="Crop" onPress={handleCrop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: window.width,
    height: window.width, // assume square for simplicity
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
