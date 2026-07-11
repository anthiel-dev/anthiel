import { Elysia } from "elysia";

import type { AppDb } from "@/database";

import { authGuardPlugin } from "@/core/better-auth.plugin";

import {
  businessIdParamsSchema,
  createBusinessBodySchema,
  updateBusinessBodySchema,
} from "../contracts/request.contract";
import {
  businessErrorResponseSchema,
  deleteBusinessResponseSchema,
  getBusinessResponseSchema,
  listBusinessesResponseSchema,
} from "../contracts/response.contract";
import { BusinessesService } from "../services/businesses.service";

export const businessesRoutes = (db: AppDb) => {
  const businessesService = new BusinessesService({ db });

  return new Elysia({ prefix: "/businesses", name: "businesses", tags: ["Businesses"] })
    .use(authGuardPlugin)
    .get(
      "",
      async () => ({
        data: await businessesService.listBusinesses(),
      }),
      {
        admin: true,
        response: listBusinessesResponseSchema,
        detail: {
          summary: "List businesses",
          operationId: "listBusinesses",
        },
      },
    )
    .get(
      "/:id",
      async ({ params, status }) => {
        const business = await businessesService.getBusinessById(params.id);
        if (!business) return status(404, { error: "Business not found" });
        return { data: business };
      },
      {
        admin: true,
        params: businessIdParamsSchema,
        response: {
          200: getBusinessResponseSchema,
          404: businessErrorResponseSchema,
        },
        detail: {
          summary: "Get business by id",
          operationId: "getBusinessById",
        },
      },
    )
    .post(
      "",
      async ({ body, status }) => {
        const result = await businessesService.createBusiness(body);
        if ("error" in result) {
          return status(500, { error: "Created business could not be loaded" });
        }
        return status(201, { data: result.data });
      },
      {
        admin: true,
        body: createBusinessBodySchema,
        response: {
          201: getBusinessResponseSchema,
          500: businessErrorResponseSchema,
        },
        detail: {
          summary: "Create business",
          operationId: "createBusiness",
        },
      },
    )
    .patch(
      "/:id",
      async ({ body, params, status }) => {
        const result = await businessesService.updateBusiness(params.id, body);
        if ("error" in result) {
          return status(404, { error: "Business not found" });
        }
        return { data: result.data };
      },
      {
        admin: true,
        params: businessIdParamsSchema,
        body: updateBusinessBodySchema,
        response: {
          200: getBusinessResponseSchema,
          404: businessErrorResponseSchema,
        },
        detail: {
          summary: "Update business",
          operationId: "updateBusiness",
        },
      },
    )
    .delete(
      "/:id",
      async ({ params, status }) => {
        const result = await businessesService.deleteBusiness(params.id);
        if ("error" in result) {
          if (result.error === "has_users") {
            return status(409, { error: "Business still has assigned users" });
          }
          if (result.error === "has_invoices") {
            return status(409, { error: "Business still has invoices" });
          }
          return status(404, { error: "Business not found" });
        }
        return { success: true as const };
      },
      {
        admin: true,
        params: businessIdParamsSchema,
        response: {
          200: deleteBusinessResponseSchema,
          404: businessErrorResponseSchema,
          409: businessErrorResponseSchema,
        },
        detail: {
          summary: "Delete business",
          operationId: "deleteBusiness",
        },
      },
    );
};
