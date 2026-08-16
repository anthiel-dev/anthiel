import { Button, Field, FieldGroup, FieldLabel, Input, cn } from "@anthiel/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "#/lib/auth-client";
import { invalidateSessionCache } from "#/lib/auth-session";
import { t } from "#/lib/copy/t";
import { authCopy } from "#features/auth/copy";

const emailFormSchema = z.object({
  email: z.email(authCopy.login.emailInvalid).trim().toLowerCase(),
});

const usernameFormSchema = z.object({
  username: z.string().trim().min(1, authCopy.login.usernameRequired),
  password: z.string().min(1, authCopy.login.passwordRequired),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type UsernameFormValues = z.infer<typeof usernameFormSchema>;
type LoginMode = "email" | "username";

type LoginFormProps = ComponentProps<"div"> & {
  redirectTo?: string;
  linkError?: string;
  defaultEmail?: string;
};

function safeInternalPath(redirectTo?: string) {
  if (redirectTo?.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }
  return "/dashboard";
}

function LoginHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <a href="/" className="flex flex-col items-center gap-2 font-medium">
        <div className="flex size-8 items-center justify-center rounded-md">
          <GalleryVerticalEnd className="size-6" />
        </div>
        <span className="sr-only">Anthiel</span>
      </a>
      <h1 className="font-heading text-xl font-bold">{authCopy.login.title}</h1>
      <p className="text-muted-foreground text-xs">{subtitle}</p>
    </div>
  );
}

export function LoginForm({
  className,
  redirectTo,
  linkError,
  defaultEmail,
  ...props
}: LoginFormProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>("email");
  const [error, setError] = useState<string | null>(linkError ? authCopy.login.linkInvalid : null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: defaultEmail ?? "" },
  });

  const usernameForm = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onEmailSubmit(values: EmailFormValues) {
    setError(null);

    const origin = window.location.origin;
    const result = await authClient.signIn.magicLink({
      email: values.email,
      callbackURL: `${origin}${safeInternalPath(redirectTo)}`,
      errorCallbackURL: `${origin}/dashboard/auth/login?email=${encodeURIComponent(values.email)}`,
    });

    if (result.error) {
      setError(result.error.message ?? authCopy.login.sendFailed);
      return;
    }

    setSentEmail(values.email);
  }

  async function onUsernameSubmit(values: UsernameFormValues) {
    setError(null);

    const result = await authClient.signIn.username({
      username: values.username,
      password: values.password,
    });

    if (result.error) {
      setError(result.error.message ?? authCopy.login.signInFailed);
      return;
    }

    invalidateSessionCache();
    await navigate({ href: safeInternalPath(redirectTo) });
  }

  function switchMode(next: LoginMode) {
    setError(null);
    setSentEmail(null);
    // Defer swap — extra username field shifts Login onto this click target.
    window.setTimeout(() => {
      emailForm.reset({ email: defaultEmail ?? "" });
      usernameForm.reset();
      setMode(next);
    }, 0);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {sentEmail ? (
        <FieldGroup>
          <LoginHeader subtitle={authCopy.login.sentTitle} />
          <p className="text-muted-foreground text-center text-sm">
            {t(authCopy.login.sentDescription, { email: sentEmail })}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setSentEmail(null)}
          >
            {authCopy.login.sendAnother}
          </Button>
        </FieldGroup>
      ) : mode === "email" ? (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
          <FieldGroup>
            <LoginHeader subtitle={authCopy.login.emailSubtitle} />

            <Field>
              <FieldLabel htmlFor="email">{authCopy.login.emailLabel}</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={authCopy.login.emailPlaceholder}
                nativeInput
                aria-invalid={Boolean(emailForm.formState.errors.email)}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email?.message ? (
                <p className="text-destructive-foreground text-xs">
                  {emailForm.formState.errors.email.message}
                </p>
              ) : null}
            </Field>

            {error ? <p className="text-destructive-foreground text-xs">{error}</p> : null}

            <Button type="submit" className="w-full" loading={emailForm.formState.isSubmitting}>
              {authCopy.login.sendLink}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => switchMode("username")}
            >
              {authCopy.login.staffSignIn}
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}>
          <FieldGroup>
            <LoginHeader subtitle={authCopy.login.usernameSubtitle} />

            <Field>
              <FieldLabel htmlFor="username">{authCopy.login.usernameLabel}</FieldLabel>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder={authCopy.login.usernamePlaceholder}
                nativeInput
                aria-invalid={Boolean(usernameForm.formState.errors.username)}
                {...usernameForm.register("username")}
              />
              {usernameForm.formState.errors.username?.message ? (
                <p className="text-destructive-foreground text-xs">
                  {usernameForm.formState.errors.username.message}
                </p>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">{authCopy.login.passwordLabel}</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                nativeInput
                aria-invalid={Boolean(usernameForm.formState.errors.password)}
                {...usernameForm.register("password")}
              />
              {usernameForm.formState.errors.password?.message ? (
                <p className="text-destructive-foreground text-xs">
                  {usernameForm.formState.errors.password.message}
                </p>
              ) : null}
            </Field>

            {error ? <p className="text-destructive-foreground text-xs">{error}</p> : null}

            <Button type="submit" className="w-full" loading={usernameForm.formState.isSubmitting}>
              {authCopy.login.submit}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => switchMode("email")}
            >
              {authCopy.login.emailSignIn}
            </Button>
          </FieldGroup>
        </form>
      )}
    </div>
  );
}
