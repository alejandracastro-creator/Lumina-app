const appJson = require('./app.json');

module.exports = ({ config } = {}) => {
  const base = config && Object.keys(config).length ? config : appJson.expo || {};
  const existingPlugins = Array.isArray(base.plugins) ? base.plugins : [];
  const hasGoogleSigninPlugin = existingPlugins.some((p) => {
    if (typeof p === 'string') return p === '@react-native-google-signin/google-signin';
    if (Array.isArray(p)) return p[0] === '@react-native-google-signin/google-signin';
    return false;
  });
  return {
    expo: {
      ...base,
      version: '1.0.4',
      android: {
        ...(base.android || {}),
        versionCode: 5,
        package: 'com.u.lumina',
      },
      plugins: hasGoogleSigninPlugin
        ? existingPlugins
        : [
            ...existingPlugins,
            [
              '@react-native-google-signin/google-signin',
              {
                googleServicesFile: './google-services.json',
              },
            ],
          ],
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
