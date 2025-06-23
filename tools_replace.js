const { withAndroidManifest } = require("@expo/config-plugins");

const withCustomAndroidManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    const app = androidManifest?.application?.[0];

    if (!app) return config;

    // Ensure xmlns:tools is declared
    androidManifest.$ = androidManifest.$ || {};
    if (!androidManifest.$["xmlns:tools"]) {
      androidManifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    app["meta-data"] = app["meta-data"] || [];

    const metaName = "com.google.firebase.messaging.default_notification_color";
    const metaResource = "@color/notification_icon_color";

    const existingMeta = app["meta-data"].find(
      (meta) => meta.$["android:name"] === metaName
    );

    if (existingMeta) {
      existingMeta.$["android:resource"] = metaResource;
      existingMeta.$["tools:replace"] = "android:resource";
    } else {
      app["meta-data"].push({
        $: {
          "android:name": metaName,
          "android:resource": metaResource,
          "tools:replace": "android:resource",
        },
      });
    }

    return config;
  });
};

module.exports = withCustomAndroidManifest;
