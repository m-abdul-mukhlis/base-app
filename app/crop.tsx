import { resolveNavigationResult } from "@/lib/navigation";
import LibProgress from "@/lib/progress";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import PanPinchView from "react-native-pan-pinch-view";


export interface LibImage_cropProps {

}

const width = Dimensions.get('window').width;
export default function m(props: LibImage_cropProps): any {
  const { image, ratio, message, forceCrop }: any = useLocalSearchParams()
  const [_image, setImage] = useState<string>(image || "")
  const [size, setSize] = useState(width)
  const [hint, setHint] = useState(true)
  const [cropCount, setCropCount] = useState(0)

  const _ratio = ratio && ratio.includes(":") ? ratio?.split(":") : [3, 2]
  const maxRatio = Math.max(_ratio)
  const viewRef = useRef<any>(null)
  const imageRef = useRef<any>(null)

  const minimalRatioSize = (width / size).toFixed(1) == (_ratio[0] / _ratio[1]).toFixed(1) ? width : Math.min(width, size)

  let ratioSize = [minimalRatioSize, minimalRatioSize]
  if (maxRatio == _ratio[0]) {
    ratioSize[0] = _ratio[0] / _ratio[1] * minimalRatioSize
  } else {
    ratioSize[1] = _ratio[1] / _ratio[0] * minimalRatioSize
  }

  function resize(image: string) {
    LibProgress.show()
    Image.getSize(image, async (actualWidth, actualHeight) => {
      var wantedMaxSize = 900
      var rawheight = actualHeight
      var rawwidth = actualWidth
      var ratio = rawwidth / rawheight
      if (rawheight > rawwidth) {
        var wantedwidth = wantedMaxSize * ratio;
        var wantedheight = wantedMaxSize;
      } else {
        var wantedwidth = wantedMaxSize;
        var wantedheight = wantedMaxSize / ratio;
      }
      const manipImage = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: wantedwidth, height: wantedheight } }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );
      setImage(manipImage.uri)
      LibProgress.hide()
    }, () => { LibProgress.hide() })
  }

  useEffect(() => {
    resize(_image)
  }, [])

  useEffect(() => {
    Image.getSize(_image, async (actualWidth, actualHeight) => {
      const h = actualHeight * width / actualWidth
      setSize(h)
    }, () => { })
  }, [_image])


  function reset() {

  }

  function capture() {
    LibProgress.show()
    let crop = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      pageX: 0,
      pageY: 0
    }
    let img = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      pageX: 0,
      pageY: 0
    }
    Image.getSize(_image, (actualWidth, actualHeight) => {
      viewRef.current!.measure((...vls: number[]) => {
        crop = {
          x: vls[0],
          y: vls[1],
          width: vls[2],
          height: vls[3],
          pageX: vls[4],
          pageY: vls[5]
        }
        imageRef.current!.measure((...vls: number[]) => {
          img = {
            x: vls[0],
            y: vls[1],
            width: vls[2],
            height: vls[3],
            pageX: vls[4],
            pageY: vls[5]
          }

          let fixPageY = crop.pageY

          if (crop.pageX < 0) {
            // cropWidth = cropWidth + crop.pageX
            crop.pageX = 0
          }
          if (fixPageY < 0) {
            // cropHeight = cropHeight + fixPageY
            fixPageY = 0
          }
          let scale = actualWidth / img.width
          let totalCropWidth = (crop.pageX + crop.width)
          let totalCropHeight = (fixPageY + crop.height)
          let cropWidth = totalCropWidth > img.width ? img.width - crop.pageX : crop.width
          let cropHeight = totalCropHeight > img.height ? img.height - fixPageY : crop.height
          // if (totalCropHeight > img.height) {
          //   fixPageY = img.height - fixPageY
          // }
          // if (totalCropWidth > img.width) {
          //   crop.pageX = img.width - crop.width
          // }

          const cropOption = {
            originX: scale * (crop.pageX > img.width ? 0 : crop.pageX),
            originY: scale * ((fixPageY) > img.height ? 0 : (fixPageY)),
            width: (scale * cropWidth) > 0 ? (scale * cropWidth) : 0,
            height: (scale * cropHeight) > 0 ? (scale * cropHeight) : 0,
          }


          ImageManipulator.manipulateAsync(
            _image,
            [{
              crop: cropOption
            }],
            { compress: 1, format: ImageManipulator.SaveFormat.PNG }
          ).then((x) => {
            if (x.uri) {
              setImage(x.uri)
              setCropCount(cropCount + 1)
            }
            LibProgress.hide()
          }).catch(() => {
            LibProgress.hide()
          })
        })
      })
    }, () => {
      LibProgress.hide()
    })
  }

  const sendBack = (uri: string, width: number, height: number) => {
    resolveNavigationResult({ uri, width, height });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }} >
      <View style={{ height: 50, flexDirection: "row", justifyContent: 'space-between' }} >
        <TouchableOpacity
          onPress={() => { }}
          style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} >
          <MaterialIcons name="close" color={'white'} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row" }} >
          <TouchableOpacity
            onPress={reset}
            style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} >
            <MaterialIcons name="undo" color={'white'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={capture}
            style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }} >
            <MaterialIcons name="crop" color={'white'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }} >

        <Image
          ref={imageRef}
          style={{ resizeMode: "contain", height: size, width: width }} source={{ uri: _image }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }} >
          <PanPinchView
            key={_image}
            minScale={0.5}
            containerDimensions={{
              width: width,
              height: size,
            }}
            contentDimensions={{
              width: ratioSize[0],
              height: ratioSize[1]
            }}
            // style={{ backgroundColor: "transparent", flex: undefined, width: LibStyle.height * 100, height: LibStyle.height * 100, alignSelf: 'center', justifyContent: 'center' }}
            maxScale={2}>
            {/* <> */}
            {/* <View style={{ backgroundColor: "rgba(0,0,0,0.5 )", flex: 1 }} />
            <View style={{ flexDirection: "row" }} >
              <View style={{ backgroundColor: "rgba(0,0,0,0.5 )", flex: 1 }} /> */}
            <View ref={viewRef} style={{ height: ratioSize[1], width: ratioSize[0], backgroundColor: 'transparent', borderWidth: 1, borderColor: "white", borderStyle: 'dashed', zIndex: 100 }} >
              <View style={{ flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: "black", borderStyle: 'dashed' }} />
            </View>
            {/* <View style={{ backgroundColor: "rgba(0,0,0,0.5 )", flex: 1 }} />
            </View>
            <View style={{ backgroundColor: "rgba(0,0,0,0.5 )", flex: 1 }} /> */}
            {/* </> */}
          </PanPinchView>
        </View>

        {
          // hint &
          <Pressable
            onPress={() => setHint(!hint)}
            style={{ opacity: hint ? 1 : 0, position: 'absolute', left: 0, right: 0, bottom: 50, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 30 }} >
            <Text style={{ color: "white", textAlign: 'center' }} >{message || "Geser dan cubit layar untuk menyesuaikan bagian foto yang ingin dipakai (pastikan bagian foto berada di dalam garis putus-putus) lalu crop jika sudah sesuai"}</Text>
          </Pressable>
        }
        {
          (!forceCrop || cropCount > 0) &&
          <View style={{ position: "absolute", bottom: 10, left: 0, right: 0 }} >
            <TouchableOpacity
              onPress={() => {
                Image.getSize(_image, (width, height) => {
                  sendBack(_image, width, height)
                }, () => { })
              }}
              style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.3)' }} >
              <Text>SAVE</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    </View>
  )
}