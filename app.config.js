const appJson = require('./app.json');

module.exports = ({ config } = {}) => {
  const base = config && Object.keys(config).length ? config : appJson.expo || {};
  return {
    expo: {
      ...base,
      version: '1.0.3',
      android: {
        ...(base.android || {}),
        versionCode: 4,
        package: 'com.u.lumina',
      },
      extra: {
        ...(base.extra || {}),
        vapidPublicKey: process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY,
        googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        googleWebClientId: process.env.GOOGLE_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        googleExpoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      },
    },
  };
};
