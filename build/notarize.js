const { notarize } = require("@electron/notarize");

module.exports = async (context) => {
  if (process.platform !== "darwin") return;

  console.log("Aftersign hook triggered, starting to notarize app...");

  if (!process.env.CI) {
    console.log("Skipping notarizing, not in CI.");
    return;
  }

  if (!("APPLE_ID" in process.env && "APPLE_ID_PASS" in process.env)) {
    console.warn("Skipping notarizing, APPLE_ID and APPLE_ID_PASS env variables must be set.");
    return;
  }

  const appId = "com.justjoostnl.f1mv.lights.integration";

  const { appOutDir } = context;

  const appName = context.packager.appInfo.productFilename;

  try {
    await notarize({
      tool: "notarytool",
      appBundleId: appId,
      appPath: `${appOutDir}/${appName}.app`,
      teamId: process.env.APPLE_TEAM_ID,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASS,
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}.`);
};