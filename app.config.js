const appJson = require('./app.json');

module.exports = ({ config } = {}) => {
  const base = config && Object.keys(config).length ? config : appJson.expo || {};
  return {
    expo: {
      ...base,
      extra: {
        ...(base.extra || {}),
        vapidPublicKey: process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY,
      },
    },
  };
};

