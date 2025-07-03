import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Dimensions,
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT / 2;
const THRESHOLD = MODAL_HEIGHT / 4;

export type ComponentModalRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  onClose?: () => void;
  children: React.ReactNode;
};

const ComponentModal = forwardRef<ComponentModalRef, Props>(({ onClose, children }, ref) => {
  const translateY = useSharedValue(MODAL_HEIGHT);
  const offsetY = useSharedValue(0);

  const [visible, setVisible] = useState(false);

  const close = useCallback(() => {
    translateY.value = withTiming(MODAL_HEIGHT, { duration: 300 }, () => {
      runOnJS(setVisible)(false);
      if (onClose) runOnJS(onClose)();
    });
  }, []);

  const open = useCallback(() => {
    setVisible(true);
    translateY.value = withTiming(0, { duration: 300 });
  }, []);

  useImperativeHandle(ref, () => ({ open, close }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + offsetY.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        offsetY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (offsetY.value > THRESHOLD) {
        runOnJS(close)();
      } else {
        offsetY.value = withSpring(0);
      }
    });

  if (!visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable style={styles.overlay} onPress={() => close()} />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.modal, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

export default ComponentModal;

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000066',
  },
  modal: {
    height: MODAL_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
});
