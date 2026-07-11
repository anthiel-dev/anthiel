import { Button, Field, FieldGroup, FieldLabel, Input, cn } from "@anthiel/ui";
import { useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useState, type ComponentProps, type FormEvent } from "react";

import { authClient } from "#/lib/auth-client";

type LoginFormProps = ComponentProps<"div"> & {
  redirectTo?: string;
};

export function LoginForm({ className, redirectTo, ...props }: LoginFormProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await authClient.signIn.username({
      username,
      password,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Unable to sign in");
      return;
    }

    if (redirectTo?.startsWith("/") && !redirectTo.startsWith("//")) {
      await navigate({ href: redirectTo });
      return;
    }

    await navigate({ to: "/dashboard" });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
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
              name="username"
              type="text"
              autoComplete="username"
              placeholder="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              nativeInput
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              nativeInput
            />
          </Field>

          {error ? <p className="text-destructive-foreground text-xs">{error}</p> : null}

          <Button type="submit" className="w-full" loading={loading}>
            Login
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
