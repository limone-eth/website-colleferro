import { defineMiddleware } from "astro:middleware";
import { isMaintenanceMode } from "@/lib/settings";
import { isAuthenticated } from "@/lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;

  // Admins/members and the login flow keep access; API and static assets pass.
  if (
    path.startsWith("/admin") ||
    path.startsWith("/api/") ||
    path.startsWith("/_") ||
    path === "/manutenzione" ||
    path === "/robots.txt" ||
    path.startsWith("/favicon") ||
    path === "/logo.webp" ||
    path === "/logo.png"
  ) {
    return next();
  }

  // Signed-in users can preview the live site even when maintenance is on.
  if (isAuthenticated(context.cookies)) {
    return next();
  }

  if (await isMaintenanceMode()) {
    return context.rewrite("/manutenzione");
  }

  return next();
});
