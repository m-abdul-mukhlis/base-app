import * as ImageManipulator from 'expo-image-manipulator';
import React, { useRef, useState } from 'react';
import {
  Button,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  View
} from 'react-native';

const window = Dimensions.get('window');
const IMAGE_SIZE = window.width; // square image for now

export default function Crop({
  imageUri,
  onCrop,
}: {
  imageUri: string;
  onCrop: (uri: string) => void;
}) {
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, size: 200 });

  const startPos = useRef({ x: 0, y: 0 });

  const moveResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startPos.current = { ...cropBox };
      },
      onPanResponderMove: (_, gesture) => {
        const newX = Math.max(0, Math.min(IMAGE_SIZE - cropBox.size, startPos.current.x + gesture.dx));
        const newY = Math.max(0, Math.min(IMAGE_SIZE - cropBox.size, startPos.current.y + gesture.dy));
        setCropBox(prev => ({ ...prev, x: newX, y: newY }));
      },
    })
  ).current;

  // Resize crop box from bottom-right
  const resizeStart = useRef({ size: 0 });

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        resizeStart.current = { size: cropBox.size };
      },
      onPanResponderMove: (_, gesture) => {
        const newSize = Math.max(
          50,
          Math.min(IMAGE_SIZE - cropBox.x, IMAGE_SIZE - cropBox.y, resizeStart.current.size + gesture.dx)
        );
        setCropBox(prev => ({ ...prev, size: newSize }));
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

      {/* Crop Box */}
      <View
        {...moveResponder.panHandlers}
        style={[
          styles.cropBox,
          {
            left: cropBox.x,
            top: cropBox.y,
            width: cropBox.size,
            height: cropBox.size,
          },
        ]}
      >
        {/* Resize Handle */}
        <View
          {...resizeResponder.panHandlers}
          style={styles.resizeHandle}
        />
      </View>

      <View style={styles.button}>
        <Button title="Crop" onPress={handleCrop} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  resizeHandle: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 15,
    margin: 2,
  },
  button: {
    marginTop: 10,
  },
});
