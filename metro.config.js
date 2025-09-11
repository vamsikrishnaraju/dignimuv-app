const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Configure Metro to work with NativeWind v4 and process global.css.
 */
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });


