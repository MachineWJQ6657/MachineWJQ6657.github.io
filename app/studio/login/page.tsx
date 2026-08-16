import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSiteAdminUser } from "../../../lib/admin-auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in · Portfolio Studio",
  description: "Private access to the portfolio editor.",
};

export default async function StudioLoginPage() {
  if (await getSiteAdminUser()) redirect("/studio");

  return (
    <main className="studio-login-shell">
      <section className="studio-login-card">
        <p className="eyebrow">Portfolio Studio</p>
        <h1>Welcome back.</h1>
        <p>Enter the private admin password to edit the site.</p>
        <LoginForm />
        <a href="/">Return to the website</a>
      </section>
    </main>
  );
}
