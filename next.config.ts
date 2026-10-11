import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // This project lives beside other desktop projects and lockfiles.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
