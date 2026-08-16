import { getChatGPTUser, type ChatGPTUser } from "../app/chatgpt-auth";

export async function getSiteAdminUser(): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  if (user) return user;

  if (process.env.NODE_ENV === "development") {
    return {
      userId: "local-preview-owner",
      displayName: "本地预览",
      email: "local@preview.invalid",
      fullName: "本地预览",
    };
  }

  return null;
}
