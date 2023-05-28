export async function handleDeepLinking(deepLinkPath: string) {
  if (deepLinkPath.startsWith("f1mvli://open/page/")) {
    const route = await deepLinkPathToRoute(deepLinkPath);
    if (route === "no_path_found") {
      return {
        action: false
      };
    }
    else {
      return {
        action: "open_page",
        page: route
      };
    }
  }
  if (deepLinkPath.startsWith("f1mvli://app/config/patch")) {
    const configPatch = await getConfigPatch(deepLinkPath);
    return {
      action: "patch_config",
      configPatch: configPatch
    };
  }
}

async function getConfigPatch(deepLinkPath: string) {
  // example path: f1mvli://app/config/patch?config=%7B%22Settings.generalSettings.autoTurnOffLights%22%3Afalse%7D
  const config = decodeURIComponent(deepLinkPath.split("?config=")[1]);
  const key = config.split(":")[0];
  const value = config.split(":")[1];
  return {
    key: key,
    value: value
  };
}
export async function deepLinkPathToRoute(deepLinkPath: string) {
  switch (deepLinkPath) {
    case "f1mvli://open/page/settings":
      return "/settings";
    case "f1mvli://open/page/about":
      return "/about";
    case "f1mvli://open/page/home":
      return "/home";
    case "f1mvli://open/page/logs":
      return "/log-viewer";
    default:
      return "no_path_found";
  }
}