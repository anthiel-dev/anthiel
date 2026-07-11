import { Elysia } from "elysia";

import type { AppDb } from "@/database";

import { authGuardPlugin } from "@/core/better-auth.plugin";

import {
  createPaymentMethodBodySchema,
  paymentMethodIdParamsSchema,
  updatePaymentMethodBodySchema,
} from "../contracts/request.contract";
import {
  deletePaymentMethodResponseSchema,
  getPaymentMethodResponseSchema,
  listPaymentMethodsResponseSchema,
  paymentMethodErrorResponseSchema,
} from "../contracts/response.contract";
import { PaymentMethodsService } from "../services/payment-methods.service";

export const paymentMethodsRoutes = (db: AppDb) => {
  const paymentMethodsService = new PaymentMethodsService({ db });

  return new Elysia({
    prefix: "/payment-methods",
    name: "payment-methods",
    tags: ["Payment methods"],
  })
    .use(authGuardPlugin)
    .get(
      "",
      async () => ({
        data: await paymentMethodsService.listPaymentMethods(),
      }),
      {
        admin: true,
        response: listPaymentMethodsResponseSchema,
        detail: {
          summary: "List payment methods",
          operationId: "listPaymentMethods",
        },
      },
    )
    .get(
      "/:id",
      async ({ params, status }) => {
        const paymentMethod = await paymentMethodsService.getPaymentMethodById(params.id);
        if (!paymentMethod) return status(404, { error: "Payment method not found" });
        return { data: paymentMethod };
      },
      {
        admin: true,
        params: paymentMethodIdParamsSchema,
        response: {
          200: getPaymentMethodResponseSchema,
          404: paymentMethodErrorResponseSchema,
        },
        detail: {
          summary: "Get payment method by id",
          operationId: "getPaymentMethodById",
        },
      },
    )
    .post(
      "",
      async ({ body, status }) => {
        const result = await paymentMethodsService.createPaymentMethod(body);
        if ("error" in result) {
          return status(500, { error: "Created payment method could not be loaded" });
        }
        return status(201, { data: result.data });
      },
      {
        admin: true,
        body: createPaymentMethodBodySchema,
        response: {
          201: getPaymentMethodResponseSchema,
          500: paymentMethodErrorResponseSchema,
        },
        detail: {
          summary: "Create payment method",
          operationId: "createPaymentMethod",
        },
      },
    )
    .patch(
      "/:id",
      async ({ body, params, status }) => {
        const result = await paymentMethodsService.updatePaymentMethod(params.id, body);
        if ("error" in result) {
          return status(404, { error: "Payment method not found" });
        }
        return { data: result.data };
      },
      {
        admin: true,
        params: paymentMethodIdParamsSchema,
        body: updatePaymentMethodBodySchema,
        response: {
          200: getPaymentMethodResponseSchema,
          404: paymentMethodErrorResponseSchema,
        },
        detail: {
          summary: "Update payment method",
          operationId: "updatePaymentMethod",
        },
      },
    )
    .delete(
      "/:id",
      async ({ params, status }) => {
        const result = await paymentMethodsService.deletePaymentMethod(params.id);
        if ("error" in result) {
          if (result.error === "has_invoices") {
            return status(409, { error: "Payment method still has invoices" });
          }
          return status(404, { error: "Payment method not found" });
        }
        return { success: true as const };
      },
      {
        admin: true,
        params: paymentMethodIdParamsSchema,
        response: {
          200: deletePaymentMethodResponseSchema,
          404: paymentMethodErrorResponseSchema,
          409: paymentMethodErrorResponseSchema,
        },
        detail: {
          summary: "Delete payment method",
          operationId: "deletePaymentMethod",
        },
      },
    );
};
