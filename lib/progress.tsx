import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef } from 'react'
import { ActivityIndicator, BackHandler, Dimensions, Modal, StyleSheet, Text, View } from 'react-native'

export interface LibProgressProps {
  message?: string
}

interface State {
  show: boolean
  message?: string
}

let setStateRef: ((s: State) => void) | null = null
let backListener: any = null

function handleBack(): boolean {
  LibProgress.hide()
  return true
}

const LibProgress = {
  show(message?: string) {
    backListener = BackHandler.addEventListener('hardwareBackPress', handleBack)
    setStateRef?.({ show: true, message })
  },
  hide() {
    backListener?.remove?.()
    setStateRef?.({ show: false, message: undefined })
  },
  Component
}

function Component() {
  const [state, setState] = React.useState<State>({ show: false, message: undefined })
  const mounted = useRef(true)

  useEffect(() => {
    setStateRef = (s) => {
      if (mounted.current) setState(s)
    }
    return () => {
      mounted.current = false
      setStateRef = null
    }
  }, [])

  if (!state.show) return null

  return (
    <Modal
      visible={state.show}
      transparent
      animationType="fade"
    >
      <StatusBar translucent style='auto' />
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator color={"orange"} size="large" />
          {state.message &&
            <Text style={styles.message}>{state.message}</Text>}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: Dimensions.get('window').width * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    color: "#000",
    marginTop: 20,
    fontSize: 16,
    lineHeight: 22
  }
})

export default LibProgress
