import type { H3Event } from "h3";
import { auth } from "../../lib/auth";

export async function getServerSession(event: H3Event) {
  return auth.api.getSession({
    headers: event.headers,
  });
}

export async function requireServerSession(event: H3Event) {
  const session = await getServerSession(event);

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  return session;
}

export async function requireAdminSession(event: H3Event) {
  const session = await requireServerSession(event);

  if (session.user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  return session;
}
