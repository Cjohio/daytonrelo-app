module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === "production";

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // VULN-10: Strip all console.* calls in production builds.
      // Prevents API key presence/length leakage via console.log in device logs.
      // Install: npm install --save-dev babel-plugin-transform-remove-console
      ...(isProduction
        ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
        : []),
    ],
  };
};
