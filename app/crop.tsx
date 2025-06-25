import * as ImageManipulator from 'expo-image-manipulator';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const screenWidth = Dimensions.get("window").width;
const ASPECT_RATIO = 1 / 1;
const initialWidth = 200;
const initialHeight = initialWidth / ASPECT_RATIO;

export default function Crop(props: any) {
  const [_image, setImage] = useState(props.imageUri);
  const [size, setSize] = useState(screenWidth);
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, width: initialWidth, height: initialHeight });
  const [realSize, setRealSize] = useState({ width: 0, height: 0 });
  const [imageBounds, setImageBounds] = useState({ x: 0, y: 0, width: screenWidth, height: size });

  const panStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0 });

  useEffect(() => {
    Image.getSize(_image, (w, h) => {
      setRealSize({ width: w, height: h });
      const newHeight = h * screenWidth / w;
      setSize(newHeight);
    });
  }, [_image]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panStart.current = { x: cropBox.x, y: cropBox.y };
      },
      onPanResponderMove: (_, gesture) => {
        const maxX = imageBounds.width - cropBox.width;
        const maxY = imageBounds.height - cropBox.height;

        const newX = Math.max(0, Math.min(maxX, panStart.current.x + gesture.dx));
        const newY = Math.max(0, Math.min(maxY, panStart.current.y + gesture.dy));

        setCropBox(prev => ({ ...prev, x: newX, y: newY }));
      }
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        resizeStart.current = { width: cropBox.width, height: cropBox.height };
      },
      onPanResponderMove: (_, gesture) => {
        let newWidth = Math.max(50, resizeStart.current.width + gesture.dx);
        let newHeight = newWidth / ASPECT_RATIO;

        // Bound checking
        if (cropBox.x + newWidth > imageBounds.width) {
          newWidth = imageBounds.width - cropBox.x;
          newHeight = newWidth / ASPECT_RATIO;
        }
        if (cropBox.y + newHeight > imageBounds.height) {
          newHeight = imageBounds.height - cropBox.y;
          newWidth = newHeight * ASPECT_RATIO;
        }

        setCropBox(prev => ({ ...prev, width: newWidth, height: newHeight }));
      }
    })
  ).current;

  const capture = () => {
    Image.getSize(_image, (w, h) => {
      const imageAspectRatio = w / h;
      const containerAspectRatio = screenWidth / size;

      let renderedWidth = screenWidth;
      let renderedHeight = size;

      if (imageAspectRatio > containerAspectRatio) {
        renderedHeight = screenWidth / imageAspectRatio;
      } else {
        renderedWidth = size * imageAspectRatio;
      }

      const offsetX = (screenWidth - renderedWidth) / 2;
      const offsetY = (size - renderedHeight) / 2;

      const scaleX = w / renderedWidth;
      const scaleY = h / renderedHeight;

      const cropX = (cropBox.x - offsetX) * scaleX;
      const cropY = (cropBox.y - offsetY) * scaleY;
      const cropW = cropBox.width * scaleX;
      const cropH = cropBox.height * scaleY;

      ImageManipulator.manipulateAsync(
        _image,
        [{ crop: { originX: cropX, originY: cropY, width: cropW, height: cropH } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      ).then(res => {
        props.onDone?.(res.uri);
      }).catch(() => console.warn('Crop failed'));
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          setImageBounds({ x, y, width, height });
        }}
        source={{ uri: _image }}
        style={{ width: screenWidth, height: size, resizeMode: 'contain' }}
      />
      <View
        {...panResponder.panHandlers}
        style={[styles.cropBox, {
          top: cropBox.y,
          left: cropBox.x,
          width: cropBox.width,
          height: cropBox.height,
        }]}
      >
        <View style={styles.dashedBorder} />
        <View
          style={styles.handle}
          {...resizeResponder.panHandlers}
        />
      </View>
      <TouchableOpacity onPress={capture} style={styles.button}>
        <Text style={{ color: 'white' }}>Crop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cropBox: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'white',
    zIndex: 10,
  },
  dashedBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderStyle: 'dashed',
  },
  button: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    borderRadius: 6,
  },
  handle: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: -10,
    right: -10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
  }
});
