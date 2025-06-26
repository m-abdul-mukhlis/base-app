import * as ImageManipulator from 'expo-image-manipulator';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const ASPECT_RATIO = 1 / 1;
const MIN_SIZE = 50;

export default function Crop(props: { imageUri: string; onDone?: (uri: string) => void }) {
  const [_image, setImage] = useState(props.imageUri);
  const [displaySize, setDisplaySize] = useState({ width: screenWidth, height: screenWidth }); // resized image view
  const [realSize, setRealSize] = useState({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, width: 200, height: 200 });

  const imageRef = useRef<Image>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0 });

  useEffect(() => {
    Image.getSize(_image, (w, h) => {
      const ratio = screenWidth / w;
      const height = h * ratio;
      setDisplaySize({ width: screenWidth, height });
      setRealSize({ width: w, height: h });
    });
  }, [_image]);

  const dragResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panStart.current = { x: cropBox.x, y: cropBox.y };
      },
      onPanResponderMove: (_, gesture) => {
        setCropBox(prev => {
          const maxX = displaySize.width - prev.width;
          const maxY = displaySize.height - prev.height;

          const newX = Math.max(0, Math.min(maxX, panStart.current.x + gesture.dx));
          const newY = Math.max(0, Math.min(maxY, panStart.current.y + gesture.dy));

          return {
            ...prev,
            x: newX,
            y: newY
          };
        });
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
        let newWidth = Math.max(MIN_SIZE, resizeStart.current.width + gesture.dx);
        let newHeight = newWidth / ASPECT_RATIO;

        const maxWidth = displaySize.width - cropBox.x;
        const maxHeight = displaySize.height - cropBox.y;

        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = newWidth / ASPECT_RATIO;
        }

        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * ASPECT_RATIO;
        }

        setCropBox(prev => ({ ...prev, width: newWidth, height: newHeight }));
      }
    })
  ).current;

  const capture = async () => {
    const renderedWidth = displaySize.width;
    const renderedHeight = displaySize.height;

    const scaleX = realSize.width / renderedWidth;
    const scaleY = realSize.height / renderedHeight;

    const cropX = cropBox.x * scaleX;
    const cropY = cropBox.y * scaleY;
    const cropW = cropBox.width * scaleX;
    const cropH = cropBox.height * scaleY;

    try {
      const result = await ImageManipulator.manipulateAsync(
        _image,
        [{ crop: { originX: cropX, originY: cropY, width: cropW, height: cropH } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      props.onDone ? props.onDone(result.uri) : setImage(result.uri);
    } catch (err) {
      console.warn('Cropping failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        ref={imageRef}
        source={{ uri: _image }}
        style={{ width: displaySize.width, height: displaySize.height }}
        resizeMode="contain"
      />
      <View
        {...dragResponder.panHandlers}
        style={[
          styles.cropBox,
          {
            top: cropBox.y,
            left: cropBox.x,
            width: cropBox.width,
            height: cropBox.height
          }
        ]}
      >
        <View style={styles.dashedBorder} />
        <View style={styles.handle} {...resizeResponder.panHandlers} />
      </View>
      <TouchableOpacity style={styles.button} onPress={capture}>
        <Text style={{ color: 'white' }}>Crop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  cropBox: {
    position: 'absolute',
    borderColor: 'white',
    borderWidth: 1
  },
  dashedBorder: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'white'
  },
  handle: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    position: 'absolute',
    right: -10,
    bottom: -10
  },
  button: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 8
  }
});
