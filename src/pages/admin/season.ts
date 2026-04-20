import type { APIRoute } from "astro";
import { isAuthenticated } from "@/lib/auth";
import { setAdminSeasonCookie } from "@/lib/season";
import { db } from "@/lib/db";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAuthenticated(cookies)) return redirect("/admin/login");
  const form = await request.formData();
  const year = Number(form.get("year") ?? 0);
  if (!year) return redirect(request.headers.get("referer") ?? "/admin");
  const { rows } = await db.execute({
    sql: "SELECT year FROM seasons WHERE year = ?",
    args: [year],
  });
  if (rows[0]) setAdminSeasonCookie(cookies, year);
  return redirect(request.headers.get("referer") ?? "/admin");
};
