// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('expo-router/babel'),
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './src',
          '@assets': './assets',
          '@components': './src/components',
          '@theme': './src/theme',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }],
      'react-native-reanimated/plugin', 
    ],
  };
};
