import { generateUniqueId } from "../utils/generateUniqueId";

let analyticsPostInterval: NodeJS.Timeout | null = null;
let userActiveId: string | null = null;
let isPosting = false;
const postUrl = "https://api.jstt.me/api/v2/f1mvli/analytics/active-users/post";

async function handlePostUserActive(): Promise<any> {
  if (!userActiveId || isPosting) return;
  isPosting = true;
  const res = await fetch(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uniqueID: userActiveId,
      userActive: true,
    }),
  });

  const json = await res.json();
  isPosting = false;
  return json;
}

export async function handleRegisterUser(): Promise<{
  userActiveId: string | null;
  resPostJson: any;
}> {
  const generatedId = generateUniqueId(8);
  if (!userActiveId) {
    userActiveId = generatedId;
  }
  const resPostJson = await handlePostUserActive();

  if (analyticsPostInterval) {
    clearInterval(analyticsPostInterval);
  }

  analyticsPostInterval = setInterval(async () => {
    console.log("Posting user active");
    await handlePostUserActive();
  }, 15000); // 15 seconds

  return {
    userActiveId,
    resPostJson,
  };
}

export async function handleUserActiveExit(): Promise<any | null> {
  let json: any | null = null;

  if (userActiveId && analyticsPostInterval) {
    clearInterval(analyticsPostInterval);
    console.log("Cleared analyticsPostInterval");
    const res = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uniqueID: userActiveId,
        userActive: false,
      }),
    });
    json = await res.json();
  }

  return json;
}

export async function handleGetStatus(): Promise<{
  isRegistered: boolean;
  userActiveId: string | null;
}> {
  return {
    isRegistered: !!userActiveId && !!analyticsPostInterval,
    userActiveId,
  };
}
