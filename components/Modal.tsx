import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_HEIGHT = SCREEN_HEIGHT / 2;
const CLOSE_THRESHOLD = 100;

export type ComponentModalRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  onClose?: () => void;
  children: React.ReactNode;
};

const ComponentModal = forwardRef<ComponentModalRef, Props>(
  ({ onClose, children }, ref) => {
    const [visible, setVisible] = useState(false);
    // const [contentHeight, setContentHeight] = useState(0);
    const contentHeight = useSharedValue(0)

    const translateY = useSharedValue(MAX_HEIGHT);
    const offsetY = useSharedValue(0);

    const open = useCallback(() => {
      setVisible(true);
      translateY.value = withTiming(0, { duration: 300 });
    }, []);

    const close = useCallback(() => {
      offsetY.value = 0; // 🛠 Reset drag offset immediately
      translateY.value = withTiming(MAX_HEIGHT, { duration: 300 }, () => {
        runOnJS(setVisible)(false);
        if (onClose) runOnJS(onClose)();
      });
    }, []);

    useImperativeHandle(ref, () => ({ open, close }));

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value + offsetY.value }],
    }));

    const gesture = Gesture.Pan()
      .onUpdate((e) => {
        if (e.translationY > 0) {
          offsetY.value = e.translationY;
        }
      })
      .onEnd(() => {
        if (offsetY.value > contentHeight.value / 2) {
          runOnJS(close)(); // ✅ Resets offsetY
        } else {
          offsetY.value = withSpring(0); // ✅ Snap back
        }
      });


    const onLayout = (e: LayoutChangeEvent) => {
      const height = e.nativeEvent.layout.height;
      contentHeight.value = Math.min(height, MAX_HEIGHT)
    };

    if (!visible) return null;

    return (
      <View style={styles.wrapper}>
        <Pressable style={styles.overlay} onPress={close} />
        <GestureDetector gesture={gesture}>
          <Animated.View
            onLayout={onLayout}
            style={[
              styles.modal,
              animatedStyle,
              { maxHeight: MAX_HEIGHT, height: 'auto' },
            ]}
          >
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

export default ComponentModal;

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000066',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
});
