// npm i -D babel-plugin-module-resolver
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      ["module-resolver", {
        root: ["./"],
        alias: {
          "@": "./src",
          "@components": "./src/components",
          "@theme": "./src/theme"
        }
      }]
    ]
  };
};
