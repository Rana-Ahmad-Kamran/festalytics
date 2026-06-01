import { requireAdminFromRequest, adminErrorResponse } from "@/lib/admin/access";

/**
 * @param {(ctx: { request: Request, admin: { uid: string, email?: string }, params?: Record<string, string> }) => Promise<Response>} handler
 */
export function withAdmin(handler) {
  return async (request, context) => {
    try {
      const admin = await requireAdminFromRequest(request);
      const params = context?.params
        ? await Promise.resolve(context.params)
        : undefined;
      return await handler({ request, admin, params });
    } catch (error) {
      console.error("[admin API]", error);
      return adminErrorResponse(error);
    }
  };
}
