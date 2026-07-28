import { Button, Field, FieldGroup, FieldLabel, Input } from "@anthiel/ui";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@anthiel/ui/components/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import type { InvoiceRecord } from "../types";

const MAX_EMAILS = 5;

const sendInvoiceEmailSchema = z.object({
  emails: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(1, "Email is required")
          .email("Enter a valid email address")
          .max(254, "Email is too long"),
      }),
    )
    .min(1, "Add at least one email")
    .max(MAX_EMAILS, `You can send to at most ${MAX_EMAILS} addresses`)
    .superRefine((emails, ctx) => {
      const seen = new Set<string>();
      for (let index = 0; index < emails.length; index += 1) {
        const normalized = emails[index]?.value.trim().toLowerCase() ?? "";
        if (!normalized) continue;
        if (seen.has(normalized)) {
          ctx.addIssue({
            code: "custom",
            message: "Email addresses must be unique",
            path: [index, "value"],
          });
          continue;
        }
        seen.add(normalized);
      }
    }),
});

type SendInvoiceEmailFormValues = z.infer<typeof sendInvoiceEmailSchema>;

type SendInvoiceEmailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceRecord | null;
  pending?: boolean;
  error?: string | null;
  onConfirm: (emails: string[]) => void;
};

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive-foreground text-xs">{message}</p>;
}

export function SendInvoiceEmailDialog({
  open,
  onOpenChange,
  invoice,
  pending = false,
  error = null,
  onConfirm,
}: SendInvoiceEmailDialogProps) {
  const formId = "send-invoice-email-form";
  const primaryEmail = invoice?.business.email?.trim() ?? "";
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<SendInvoiceEmailFormValues>({
    resolver: zodResolver(sendInvoiceEmailSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      emails: [{ value: primaryEmail }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "emails",
  });

  useEffect(() => {
    if (!open) return;
    reset({
      emails: [{ value: invoice?.business.email?.trim() ?? "" }],
    });
    clearErrors();
    setSubmitError(null);
  }, [clearErrors, invoice, open, reset]);

  function onSubmit(values: SendInvoiceEmailFormValues) {
    setSubmitError(null);
    if (!primaryEmail) {
      setSubmitError("This business has no email address. Add one before sending.");
      return;
    }
    onConfirm(values.emails.map((email) => email.value.trim()));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Send invoice email</DialogTitle>
          <DialogDescription>
            Confirm recipients for{" "}
            <span className="font-medium text-foreground">{invoice?.number ?? "this invoice"}</span>
            . The first address is the business email and cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <form id={formId} noValidate onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {fields.map((field, index) => {
                const isPrimary = index === 0;
                const isLast = index === fields.length - 1;
                const canAdd = isLast && fields.length < MAX_EMAILS;
                const canRemove = !isPrimary;
                const fieldError = errors.emails?.[index]?.value?.message;

                return (
                  <Field key={field.id} className="w-full items-stretch">
                    <FieldLabel htmlFor={`send-invoice-email-${index}`}>
                      {isPrimary ? "Business email" : `Additional email ${index}`}
                    </FieldLabel>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        id={`send-invoice-email-${index}`}
                        type="email"
                        autoComplete="email"
                        nativeInput
                        readOnly={isPrimary}
                        disabled={pending}
                        className="min-w-0 flex-1"
                        {...register(`emails.${index}.value`)}
                        aria-invalid={fieldError ? true : undefined}
                      />
                      {canRemove ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0"
                          aria-label={`Remove email ${index + 1}`}
                          disabled={pending}
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon />
                        </Button>
                      ) : null}
                      {canAdd ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="shrink-0"
                          aria-label="Add email address"
                          disabled={pending}
                          onClick={() => append({ value: "" })}
                        >
                          <PlusIcon />
                        </Button>
                      ) : null}
                    </div>
                    <FieldMessage message={fieldError} />
                  </Field>
                );
              })}
              <FieldMessage message={errors.emails?.message ?? errors.emails?.root?.message} />
              {submitError || error ? (
                <p className="text-destructive-foreground text-xs">{submitError ?? error}</p>
              ) : null}
            </FieldGroup>
          </form>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={pending} />}>Cancel</DialogClose>
          <Button type="submit" form={formId} loading={pending} disabled={!primaryEmail}>
            Send email
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
