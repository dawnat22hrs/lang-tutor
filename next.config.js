const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
