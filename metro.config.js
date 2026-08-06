const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts = Array.from(
  new Set([...(config.resolver.assetExts ?? []), 'wasm']),
);
config.resolver.sourceExts = (config.resolver.sourceExts ?? []).filter(
  (ext) => ext !== 'wasm',
);

const previousEnhanceMiddleware = config.server?.enhanceMiddleware;
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    const base = previousEnhanceMiddleware
      ? previousEnhanceMiddleware(middleware, server)
      : middleware;
    return (req, res, next) => {
      // Required for expo-sqlite web (SharedArrayBuffer).
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      return base(req, res, next);
    };
  },
};

module.exports = config;
