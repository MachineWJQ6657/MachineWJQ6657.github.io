import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyAdminPassword,
} from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length > 512 || !(await verifyAdminPassword(password))) {
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = await createAdminSessionToken();
    if (!token) {
      return Response.json({ error: "Admin access is not configured." }, { status: 503 });
    }

    return Response.json(
      { ok: true },
      {
        headers: {
          "cache-control": "no-store",
          "set-cookie": `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
        },
      },
    );
  } catch {
    return Response.json({ error: "Unable to sign in." }, { status: 400 });
  }
}
