const { withAndroidManifest } = require("@expo/config-plugins");

const withCustomAndroidManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;

    // Find the <application> tag and add the meta-data with tools:replace
    if (androidManifest && androidManifest.application && androidManifest.application[0]) {
      const application = androidManifest.application[0];

      const metaData = application["meta-data"] || [];
      const existingMetaData = metaData.find(
        (meta) => meta.$["android:name"] === "com.google.firebase.messaging.default_notification_color"
      );

      if (existingMetaData) {
        existingMetaData.$["tools:replace"] = "android:resource";
      } else {
        // Add a new <meta-data> tag if not found
        application["meta-data"] = [
          ...metaData,
          {
            $: {
              "android:name": "com.google.firebase.messaging.default_notification_color",
              "android:resource": "@color/notification_icon_color",
              "tools:replace": "android:resource",
            },
          },
        ];
      }
    }

    return config;
  });
};

module.exports = withCustomAndroidManifest;
