const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.worker\.ts$/,
      use: { loader: 'worker-loader', options: { type: 'module' } },
    });
    return config;
  },
};
module.exports = nextConfig;
