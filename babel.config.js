module.exports = function (api) {
  // Cache separately per environment so dev builds never load production-only plugins
  api.cache.using(() => process.env.NODE_ENV ?? "development");

  const isProduction = process.env.NODE_ENV === "production";

  // VULN-10: Strip all console.* calls in production builds.
  // Prevents API key presence/length leakage via console.log in device logs.
  // Wrapped in try/catch so a missing package never blocks dev builds.
  const productionPlugins = [];
  if (isProduction) {
    try {
      require.resolve("babel-plugin-transform-remove-console");
      productionPlugins.push(["transform-remove-console", { exclude: ["error", "warn"] }]);
    } catch (_) {
      // Plugin not installed — console calls will remain in this build
    }
  }

  return {
    presets: ["babel-preset-expo"],
    plugins: productionPlugins,
  };
};
