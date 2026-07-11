import { Elysia } from "elysia";

import type { AppDb } from "@/database";

import { authGuardPlugin } from "@/core/better-auth.plugin";
import { isAdmin } from "@/modules/rbac";

import {
  createInvoiceBodySchema,
  invoiceIdParamsSchema,
  invoiceShareTokenParamsSchema,
  listInvoicesQuerySchema,
  updateInvoiceBodySchema,
} from "../contracts/request.contract";
import {
  deleteInvoiceResponseSchema,
  getInvoiceResponseSchema,
  getPublicInvoiceResponseSchema,
  invoiceErrorResponseSchema,
  listInvoicesResponseSchema,
} from "../contracts/response.contract";
import { InvoicesService } from "../services/invoices.service";

export const invoicesRoutes = (db: AppDb) => {
  const invoicesService = new InvoicesService({ db });

  return new Elysia({ prefix: "/invoices", name: "invoices", tags: ["Invoices"] })
    .use(authGuardPlugin)
    .get(
      "/public/:token",
      async ({ params, status }) => {
        const invoice = await invoicesService.getPublicInvoiceByToken(params.token);
        if (!invoice) return status(404, { error: "Invoice not found" });
        return { data: invoice };
      },
      {
        params: invoiceShareTokenParamsSchema,
        response: {
          200: getPublicInvoiceResponseSchema,
          404: invoiceErrorResponseSchema,
        },
        detail: {
          summary: "Get public invoice by share token",
          operationId: "getPublicInvoiceByToken",
        },
      },
    )
    .get(
      "",
      async ({ query, user }) => {
        const admin = isAdmin(user.role);
        return {
          data: await invoicesService.listInvoices({
            isAdmin: admin,
            currentUserId: user.id,
            query: admin ? query : { status: query.status },
          }),
        };
      },
      {
        auth: true,
        query: listInvoicesQuerySchema,
        response: listInvoicesResponseSchema,
        detail: {
          summary: "List invoices",
          operationId: "listInvoices",
        },
      },
    )
    .get(
      "/:id",
      async ({ params, status, user }) => {
        const invoice = await invoicesService.getInvoiceById(params.id, {
          isAdmin: isAdmin(user.role),
          currentUserId: user.id,
        });
        if (!invoice) return status(404, { error: "Invoice not found" });
        return { data: invoice };
      },
      {
        auth: true,
        params: invoiceIdParamsSchema,
        response: {
          200: getInvoiceResponseSchema,
          404: invoiceErrorResponseSchema,
        },
        detail: {
          summary: "Get invoice by id",
          operationId: "getInvoiceById",
        },
      },
    )
    .post(
      "",
      async ({ body, status, user }) => {
        const result = await invoicesService.createInvoice(body, user.id);

        if ("error" in result) {
          if (result.error === "business_not_found") {
            return status(404, { error: "Business not found" });
          }
          return status(500, { error: "Created invoice could not be loaded" });
        }

        return status(201, { data: result.data });
      },
      {
        admin: true,
        body: createInvoiceBodySchema,
        response: {
          201: getInvoiceResponseSchema,
          404: invoiceErrorResponseSchema,
          500: invoiceErrorResponseSchema,
        },
        detail: {
          summary: "Create invoice",
          operationId: "createInvoice",
        },
      },
    )
    .patch(
      "/:id",
      async ({ body, params, status }) => {
        const result = await invoicesService.updateInvoice(params.id, body);

        if ("error" in result) {
          if (result.error === "invoice_not_found") {
            return status(404, { error: "Invoice not found" });
          }
          if (result.error === "business_not_found") {
            return status(404, { error: "Business not found" });
          }
          if (result.error === "not_editable") {
            return status(409, { error: "Only draft invoices can be edited" });
          }
          if (result.error === "invalid_status_transition") {
            return status(409, { error: "Invalid status transition" });
          }
          return status(409, { error: "Unable to update invoice" });
        }

        return { data: result.data };
      },
      {
        admin: true,
        params: invoiceIdParamsSchema,
        body: updateInvoiceBodySchema,
        response: {
          200: getInvoiceResponseSchema,
          404: invoiceErrorResponseSchema,
          409: invoiceErrorResponseSchema,
        },
        detail: {
          summary: "Update invoice",
          operationId: "updateInvoice",
        },
      },
    )
    .delete(
      "/:id",
      async ({ params, status }) => {
        const result = await invoicesService.deleteInvoice(params.id);

        if ("error" in result) {
          if (result.error === "not_draft") {
            return status(409, { error: "Only draft invoices can be deleted" });
          }
          return status(404, { error: "Invoice not found" });
        }

        return { success: true as const };
      },
      {
        admin: true,
        params: invoiceIdParamsSchema,
        response: {
          200: deleteInvoiceResponseSchema,
          404: invoiceErrorResponseSchema,
          409: invoiceErrorResponseSchema,
        },
        detail: {
          summary: "Delete invoice",
          operationId: "deleteInvoice",
        },
      },
    );
};
