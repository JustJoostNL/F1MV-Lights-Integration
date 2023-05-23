export default async function deepLinkPathToRoute(deepLinkPath: string) {
  switch (deepLinkPath) {
    case "f1mvli://open/page/settings":
      return "/settings";
    case "f1mvli://open/page/about":
      return "/about";
  }
}