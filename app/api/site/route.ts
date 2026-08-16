import { getSiteAdminUser } from "../../../lib/admin-auth";
import { claimOrVerifyOwner, readSite, writeSite } from "../../../lib/site-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const result = await readSite();
    const etag = `"site-${result.version}"`;
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: { etag } });
    }
    return Response.json(result, {
      headers: { "cache-control": "no-store", etag },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "读取失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSiteAdminUser();
    if (!user) return Response.json({ error: "请先登录后再编辑" }, { status: 401 });

    const allowed = await claimOrVerifyOwner(user.userId, user.email);
    if (!allowed) return Response.json({ error: "此站点已有管理员" }, { status: 403 });

    const body = await request.text();
    if (body.length > 150_000) return Response.json({ error: "内容过大" }, { status: 413 });
    const result = await writeSite(JSON.parse(body));
    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 400 });
  }
}
