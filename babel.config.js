module.exports = function (api) {
  api.cache(false);

  const presets = [
    "@babel/preset-env"
  ];
  const plugins = [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-transform-runtime",
  ];

  return {
    presets,
    plugins
  };
}