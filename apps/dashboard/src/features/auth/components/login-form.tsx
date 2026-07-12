import { Button, Field, FieldGroup, FieldLabel, Input, cn } from "@anthiel/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "#/lib/auth-client";
import { invalidateSessionCache } from "#/lib/auth-session";

const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type LoginFormProps = ComponentProps<"div"> & {
  redirectTo?: string;
};

export function LoginForm({ className, redirectTo, ...props }: LoginFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);

    const result = await authClient.signIn.username({
      username: values.username,
      password: values.password,
    });

    if (result.error) {
      setError(result.error.message ?? "Unable to sign in");
      return;
    }

    invalidateSessionCache();

    if (redirectTo?.startsWith("/") && !redirectTo.startsWith("//")) {
      await navigate({ href: redirectTo });
      return;
    }

    // Clients are redirected to invoices by the dashboard index guard.
    await navigate({ to: "/dashboard" });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Anthiel</span>
            </a>
            <h1 className="font-heading text-xl font-bold">Welcome to Anthiel</h1>
            <p className="text-muted-foreground text-xs">Sign in with your username and password</p>
          </div>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="username"
              nativeInput
              aria-invalid={Boolean(errors.username)}
              {...register("username")}
            />
            {errors.username?.message ? (
              <p className="text-destructive-foreground text-xs">{errors.username.message}</p>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              nativeInput
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password?.message ? (
              <p className="text-destructive-foreground text-xs">{errors.password.message}</p>
            ) : null}
          </Field>

          {error ? <p className="text-destructive-foreground text-xs">{error}</p> : null}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Login
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
