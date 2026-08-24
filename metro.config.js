const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// NativeWind v4 compiles Tailwind through Metro; without this the className
// prop silently does nothing. Not in the house guide, which predates v4's
// Metro requirement.
module.exports = withNativeWind(getDefaultConfig(__dirname), {
  input: './src/global.css',
});
