import { generateUniqueId } from "../utils/generateUniqueId";

class AnalyticsApiError extends Error {
  constructor(
    message: string,
    public readonly response: Response,
  ) {
    super(message);

    this.name = "AnalyticsApiError";
  }
}

let analyticsPostInterval: NodeJS.Timeout | null = null;
let userActiveId: string | null = null;
let isPosting = false;
const postUrl = "https://api.jstt.me/api/v2/f1mvli/analytics/active-users/post";

async function handlePostUserActive() {
  if (!userActiveId || isPosting) return;
  isPosting = true;

  const response = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uniqueID: userActiveId, userActive: true }),
  });

  if (!response.ok) {
    isPosting = false;
    throw new AnalyticsApiError("Failed to post user active status", response);
  }

  const json = await response.json();

  isPosting = false;
  return json;
}

export async function handleRegisterUser() {
  const generatedId = generateUniqueId(8);
  if (!userActiveId) userActiveId = generatedId;

  // Initial post
  await handlePostUserActive();

  if (analyticsPostInterval) clearInterval(analyticsPostInterval);
  analyticsPostInterval = setInterval(async () => {
    await handlePostUserActive();
  }, 15000); // 15 seconds
}

export async function handleUserActiveExit() {
  if (userActiveId && analyticsPostInterval) {
    clearInterval(analyticsPostInterval);
    const response = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uniqueID: userActiveId, userActive: false }),
    });

    if (!response.ok) {
      throw new AnalyticsApiError(
        "Failed to post user active status",
        response,
      );
    }

    userActiveId = null;
  }
}

export function handleGetStatus() {
  return {
    isRegistered: !!userActiveId && !!analyticsPostInterval,
    userActiveId,
  };
}
