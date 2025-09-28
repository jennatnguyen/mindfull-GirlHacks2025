module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          // If babel.config.js is in frontend/, keep 'path: ".env"'
          // If babel.config.js is at repo root, set path: 'frontend/.env'
         path: '.env',
          // Safer to fail fast if undefined:
          allowUndefined: false,
          safe: false,
        },
      ],
    ],
  }
}
