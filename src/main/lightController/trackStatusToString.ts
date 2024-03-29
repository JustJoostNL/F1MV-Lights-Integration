import { ITrackStatus } from "../../shared/multiviewer/graphql_api_types";

export function trackStatusToString(
  status: ITrackStatus["Status"] | undefined,
) {
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
