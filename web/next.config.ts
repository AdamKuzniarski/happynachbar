import type { NextConfig } from "next";

const cdnBase = process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL;

let cdnHost: string | undefined;
try {
  if (cdnBase) cdnHost = new URL(cdnBase).hostname;
} catch {}

const nextConfig: NextConfig = {
  images: cdnHost
    ? {
        remotePatterns: [
          { protocol: "https", hostname: cdnHost, pathname: "/**" },
        ],
      }
    : undefined,
};

export default nextConfig;
