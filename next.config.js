/** @type {import('next').NextConfig} */
module.exports = {
  poweredByHeader: false,
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(graphql)$/,
      exclude: /node_modules/,
      use: "graphql-tag/loader",
    });

    return config;
  },
};
