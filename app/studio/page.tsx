import type { Metadata } from "next";
import { requireChatGPTUser } from "../chatgpt-auth";
import { getSiteAdminUser } from "../../lib/admin-auth";
import { DEFAULT_SITE } from "../../lib/site-content";
import { Studio } from "./studio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "编辑站点 · Portfolio Studio",
  description: "实时自定义你的个人网站。",
};

export default async function StudioPage() {
  const user = await getSiteAdminUser();
  const admin = user ?? await requireChatGPTUser("/studio");
  return <Studio initialData={DEFAULT_SITE} userName={admin.displayName} />;
}
