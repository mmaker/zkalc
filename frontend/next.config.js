const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    mdxRs: true,
  },
  // god only knows what the fuck this thing does
  // https://github.com/plouc/nivo/issues/1941
  transpilePackages: ["@nivo"], experimental: { esmExternals: "loose"}
}

const withMDX = require('@next/mdx')()
module.exports = withMDX(nextConfig)
