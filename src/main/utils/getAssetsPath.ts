import path from "path";

export function getAssetsPath(relativePath?: string): string {
  const assetsPath = process.env.VITE_DEV_SERVER_URL
    ? path.join(__dirname, "../../src/shared/assets")
    : path.join(process.resourcesPath, "assets");

  return relativePath ? path.join(assetsPath, relativePath) : assetsPath;
}
