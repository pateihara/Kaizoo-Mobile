// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], 
    plugins: [
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
    ],
  };
};
