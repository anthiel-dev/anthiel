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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "#/lib/auth-client";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const emptyValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive-foreground text-xs">{message}</p>;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const formId = "change-password-form";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(emptyValues);
    setError(null);
  }, [open, reset]);

  async function onSubmit(values: ChangePasswordFormValues) {
    setError(null);

    const result = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });

    if (result.error) {
      setError(result.error.message ?? "Unable to change password");
      return;
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one. Other sessions will be signed out.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="change-password-current">Current password</FieldLabel>
                <Input
                  id="change-password-current"
                  type="password"
                  autoComplete="current-password"
                  nativeInput
                  aria-invalid={Boolean(errors.currentPassword)}
                  {...register("currentPassword")}
                />
                <FieldMessage message={errors.currentPassword?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor="change-password-new">New password</FieldLabel>
                <Input
                  id="change-password-new"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  nativeInput
                  aria-invalid={Boolean(errors.newPassword)}
                  {...register("newPassword")}
                />
                <FieldMessage message={errors.newPassword?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor="change-password-confirm">Confirm new password</FieldLabel>
                <Input
                  id="change-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  nativeInput
                  aria-invalid={Boolean(errors.confirmPassword)}
                  {...register("confirmPassword")}
                />
                <FieldMessage message={errors.confirmPassword?.message} />
              </Field>
              {error ? <p className="text-destructive-foreground text-xs">{error}</p> : null}
            </FieldGroup>
          </form>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form={formId} loading={isSubmitting}>
            Change password
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
