import userClass from '@/app/user/class';
import useStorage from '@/components/useStorage';
import { AuthorizationStatus, getMessaging } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => (
    {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      shouldShowBanner: true,
      shouldShowList: true
    }
  )
});

function rebuildNotificationData(data: any) {
  const out: { title: string, body: string, data: any } = { title: '', body: '', data: null }
  if (Platform.OS == 'android') {
    if (data.notification) {
      if (data.notification?.request?.content) {
        out.title = data.notification?.request?.content?.title
        out.body = data.notification?.request?.content?.body
        out.data = { ...data.notification?.request?.content?.data, title: out.title, body: out.body }
      } else if (data.notification?.title) {
        out.title = data.notification?.title
        out.body = data.notification?.body
        out.data = { ...data?.data, title: out.title, body: out.body }
      }
    }
  } else if (Platform.OS == 'ios') {
    if (data.notification?.request?.content) {
      out.title = data.notification?.request?.content?.title
      out.body = data.notification?.request?.content?.body
      if (data.notification?.request?.trigger?.payload) {
        let rawData = data.notification?.request?.trigger?.payload
        delete rawData["aps"]
        delete rawData["google.c.sender.id"]
        delete rawData["gcm.message_id"]
        delete rawData["google.c.fid"]
        delete rawData["google.c.a.e"]
        out.data = { ...rawData, title: out.title, body: out.body }
      } else {
        out.data = { ...data.notification?.request?.content?.data, title: out.title, body: out.body }
      }
    } else if (data?.notification?.title) {
      out.title = data.notification?.title
      out.body = data.notification?.body
      out.data = { ...data?.data, title: out.title, body: out.body }
    }
  }
  return out
}


function checkNotifStorage(title?: string) {
  useStorage.getItem('remoteMessage').then((val) => {
    if (val) {
      // LibNotification.onAction(JSON.parse(v), title)
      useStorage.removeItem('remoteMessage')
    }
  })
}

getMessaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
  useStorage.setItem('remoteMessage', JSON.stringify(remoteMessage))
});

getMessaging().onTokenRefresh((token) => {
  useStorage.getItem("token").then((old: any) => {
    if (old != token) {
      userClass.sendToken(token)
    }
  })
})



export interface notificationTrigger {
  delayInMinutes: number,
  repeats?: boolean
}

export interface notificationContent {
  title: string,
  message: string,
  module?: string,
  url?: string
  arguments?: any
}


const handlePushNotification = async (remoteMessage: any) => {
  const notification = {
    title: remoteMessage?.notification?.title,
    body: remoteMessage?.notification?.body,
    data: { ...remoteMessage.data, messageId: remoteMessage?.messageId }, // optional data payload
  };
  if (remoteMessage) {
    useStorage.setItem('remoteMessage', JSON.stringify(remoteMessage))
  }
  await Notifications.scheduleNotificationAsync({ content: notification, trigger: null });
};


const libNotification = {
  effect() {
    setTimeout(() => {
      checkNotifStorage()
    }, 500);

    let unMessage = getMessaging().onMessage(handlePushNotification);
    let unonNotificationOpenedApp = getMessaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage) {
        useStorage.setItem('remoteMessage', JSON.stringify(remoteMessage))
      }
      setTimeout(() => {
        checkNotifStorage("onNotificationOpenedApp")
      }, 500);
    });

    getMessaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        useStorage.setItem('remoteMessage', JSON.stringify(remoteMessage))
      }
      setTimeout(() => {
        checkNotifStorage("getInitialNotification")
      }, 500);
    });

    return () => {
      unMessage()
      unonNotificationOpenedApp()
    }
  },
  requestPermission(callback?: (token: any) => void): Promise<any> {
    return new Promise(async (r) => {
      let settings = await Notifications.getPermissionsAsync();
      if (!settings.granted) {
        settings = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true
          },
          android: {}
        });
      }
      const authStatus = await getMessaging().requestPermission();
      const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        await getMessaging().registerDeviceForRemoteMessages()
        getMessaging()
          .getToken()
          .then(
            token => {
              callback?.(token)
            }
          )
          .catch(() => {
            callback?.(null)
          })
      } else {
        callback?.(null)
      }
    })
  },
  cancelLocalNotification(notif_id: string) {
    Notifications.cancelScheduledNotificationAsync(notif_id)
  },
  setLocalNotification(action: "alert" | "default" | "update", content: notificationContent, trigger: notificationTrigger, callback?: (notif_id: string) => void): void {
    const triggerSeconds = Number(trigger?.delayInMinutes) * 60
    const _trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: triggerSeconds,
      repeats: !!trigger?.repeats,
    }
    const params = { status: 3, url: content?.url, ...content?.arguments }
    Notifications.scheduleNotificationAsync({
      content: {
        title: content?.title,
        body: content?.message,
        data: {
          action: action,
          module: content.module,
          title: content?.title,
          message: content?.message,
          params,
        },
      },
      trigger: _trigger,
    }).then((notifId) => {
      callback?.(notifId)
    }).catch((r) => {
    })
  }
}

export default libNotification