const appJson = require('./app.json');

module.exports = ({ config } = {}) => {
  const base = config && Object.keys(config).length ? config : appJson.expo || {};
  const existingPlugins = Array.isArray(base.plugins) ? base.plugins : [];
  const nextPlugins = existingPlugins.map((p) => {
    if (typeof p === 'string') {
      if (p !== '@react-native-google-signin/google-signin') return p;
      return [
        '@react-native-google-signin/google-signin',
        {
          googleServicesFile: './google-services.json',
          iosUrlScheme: '',
        },
      ];
    }
    if (Array.isArray(p) && p[0] === '@react-native-google-signin/google-signin') {
      return [
        '@react-native-google-signin/google-signin',
        {
          ...(typeof p[1] === 'object' && p[1] ? p[1] : {}),
          googleServicesFile: './google-services.json',
          iosUrlScheme: '',
        },
      ];
    }
    return p;
  });
  const hasGoogleSigninPlugin = nextPlugins.some((p) => Array.isArray(p) && p[0] === '@react-native-google-signin/google-signin');
  return {
    expo: {
      ...base,
      version: '1.0.5',
      android: {
        ...(base.android || {}),
        versionCode: 6,
        package: 'com.u.lumina',
      },
      plugins: hasGoogleSigninPlugin
        ? nextPlugins
        : [
            ...nextPlugins,
            [
              '@react-native-google-signin/google-signin',
              {
                googleServicesFile: './google-services.json',
                iosUrlScheme: '',
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
