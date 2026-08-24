module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@app': './src/app',
            '@api': './src/api',
            '@features': './src/features',
            '@navigation': './src/navigation',
            '@shared': './src/shared',
            '@assets': './src/assets',
            '@config': './src/config',
            '@stores': './src/stores',
            '@theme': './src/theme',
          },
        },
      ],
      // Reanimated 4 moved its babel plugin into react-native-worklets.
      // The house guide still names react-native-reanimated/plugin, which
      // does not exist on this version. Must stay last.
      'react-native-worklets/plugin',
    ],
  };
};
