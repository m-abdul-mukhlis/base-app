import { createTimeout } from '@/components/useTImeout';
import { Ionicons } from '@expo/vector-icons';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle
} from 'react-native';

export interface LibInputProps extends TextInputProps {
  icon?: string,
  label?: string,
  mask?: string,
  maskFrom?: 'start' | 'end',
  inputAlign?: 'left' | 'center' | 'right',
  suffix?: string,
  onPress?: () => void,
  helper?: string,
  containerStyle?: StyleProp<ViewStyle>,
  rightView?: () => React.ReactNode,
}

export interface LibInputRef {
  getText: () => string;
  getTextMasked: () => string;
  setText: (text: string) => void;
  focus: () => void;
  blur: () => void;
  setError: (msg: string) => void;
  clearError: () => void;
  setHelper: (msg: string) => void;
  clearHelper: () => void;
}

function escapeRegExp(str: string): string {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const LibInput = forwardRef<LibInputRef, LibInputProps>((props, ref) => {
  const inputRef = useRef<TextInput>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [helper, setHelper] = useState<string | undefined>(props.helper);
  // const [text, setTextState] = useState('');
  const textRef = useRef<string>("");

  const unmask = (text: string): string => {
    if (!props.mask) return text;
    let result = text;
    const masks = props.mask.match(/((?!\#).)/g);
    if (masks) {
      masks.forEach(m => {
        result = result.replace(new RegExp(escapeRegExp(m), 'g'), '');
      });
    }
    return result;
  };

  const mask = (text: string): string => {
    if (!props.mask) return text;
    const maskFrom = props.maskFrom || 'start';
    const rMask = props.mask.split("");
    const rText = unmask(text).split("");
    if (maskFrom === 'end') {
      rMask.reverse();
      rText.reverse();
    }

    let masked = '';
    let addRange = 0;
    let maskChar = '';
    for (let i = 0; i < rMask.length; i++) {
      const c = rMask[i];
      if (c === '#') {
        if (rText[i - addRange] !== undefined) {
          masked += maskChar + rText[i - addRange];
        } else {
          break;
        }
        maskChar = '';
      } else {
        maskChar += c;
        addRange++;
      }
    }

    return maskFrom === 'end' ? masked.split('').reverse().join('') : masked;
  };

  // const handleChangeText = (e: string) => {
  //   const masked = mask(e);
  //   setTextState(masked);
  //   if (error) clearError();
  //   props.onChangeText?.(unmask(masked));
  // };

  const handleChangeText = (e: string) => {
    const masked = mask(e);
    inputRef.current?.setNativeProps?.({ text: masked });
    textRef.current = masked;
    if (error) clearError();
    props.onChangeText?.(unmask(masked));
  };

  const setText = (val: string) => {
    const masked = mask(val);
    textRef.current = masked;
    // setTextState(masked);
    inputRef.current?.setNativeProps?.({ text: masked });
  };

  const focus = () => inputRef.current?.focus();
  const blur = () => inputRef.current?.blur();
  const getText = () => unmask(textRef.current);
  const getTextMasked = () => textRef.current;
  // const getText = () => unmask(text);
  // const getTextMasked = () => text;
  const clearError = () => setError(undefined);
  const clearHelper = () => setHelper(undefined);

  useEffect(() => {
    const timeout = createTimeout();
    timeout.set(() => {
      if (props.defaultValue) {
        setText(props.defaultValue);
      }
      timeout.clear();
    }, 300);
  }, []);

  useImperativeHandle(ref, () => ({
    getText,
    getTextMasked,
    setText,
    focus,
    blur,
    setError,
    clearError,
    setHelper,
    clearHelper
  }));

  const borderColor = error ? 'red' : hasFocus ? "#ec4e1e" : "transparent";

  // const borderColor = useMemo(() => {
  //   if (error) return 'red';
  //   if (hasFocus) return '#ec4e1e';
  //   return 'transparent';
  // }, [error, hasFocus]);

  return (
    <View style={{ marginBottom: 2, marginTop: 8 }}>
      <View pointerEvents={props.editable === false ? "none" : "auto"} style={[{
        backgroundColor: "#fef3f0",
        marginTop: 10,
        borderWidth: 1.2,
        borderColor,
        borderRadius: 15,
        marginHorizontal: 20,
        padding: 5, paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center'
      }, props?.containerStyle]}>
        {props?.icon &&
          //@ts-ignore
          <Ionicons name={props.icon} size={18} />
        }
        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            fontFamily: "Roboto-Medium",
            fontSize: 16,
            color: "#000",
            marginRight: 30,
            marginLeft: 10,
            textAlign: props.inputAlign || "left"
          }}
          placeholder={props.placeholder}
          maxLength={props.mask ? props.mask.length : undefined}
          placeholderTextColor="#e5e5e5"
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          onChangeText={handleChangeText}
          {...props}
        />
        {props?.rightView?.()}
      </View>
      {(error || helper) && (
        <Text
          style={{
            color: error ? 'red' : '#888',
            fontSize: 12,
            marginHorizontal: 25,
            marginTop: 5
          }}>
          {error || helper}
        </Text>
      )}
    </View>
  );
});

export default LibInput;
