import { integrationStates } from "../lightController/integrations/states";

const baseUrl = "https://api.jstt.me/api/v2";
const liveSessionUrl = `${baseUrl}/f1tv/live-session`;

export async function handleMiscIntegrationStateChecks() {
  await fetch(liveSessionUrl)
    .then((res) => res.json())
    .then((data) => {
      integrationStates.f1tvLiveSession = Boolean(data.liveSessionFound);
    });
}
