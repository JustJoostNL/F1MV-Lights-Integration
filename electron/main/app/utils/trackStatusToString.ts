export default async function trackStatusToString(status: string) {
  switch (status) {
    case "1":
      return "Green flag";
    case "2":
      return "Yellow flag";
    case "4":
      return "Safety car";
    case "5":
      return "Red flag";
    case "6":
      return "Virtual safety car";
    case "7":
      return "VSC Ending";
    default:
      return "Unknown status";
  }
}