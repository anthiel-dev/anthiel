import { Button, Field, FieldLabel, Input } from "@anthiel/ui";
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
import { toastManager } from "@anthiel/ui/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  getListProjectApiKeysQueryKey,
  useCreateProjectApiKey,
  useDeleteProjectApiKey,
  useListProjectApiKeys,
} from "#/generated/api";

import type { ProjectRecord } from "../types";

type ProjectApiKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectRecord | null;
};

/** `ath_` + 64 hex chars */
const API_KEY_LENGTH = 68;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "object" && error && "error" in error) {
    return String(error.error);
  }
  return fallback;
}

function maskKey(prefix: string) {
  const bulletCount = Math.max(0, API_KEY_LENGTH - prefix.length);
  return `${prefix}${"•".repeat(bulletCount)}`;
}

async function copyTextToClipboard(text: string, input: HTMLInputElement | null) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for non-secure origins / denied permissions.
    }
  }

  if (!input) {
    throw new Error("Unable to copy API key");
  }

  const previousType = input.type;
  input.type = "text";
  input.focus();
  input.select();
  input.setSelectionRange(0, input.value.length);
  const copied = document.execCommand("copy");
  input.type = previousType;
  input.setSelectionRange(0, 0);

  if (!copied) {
    throw new Error("Unable to copy API key");
  }
}

function readCreatedApiKey(response: unknown) {
  if (!response || typeof response !== "object" || !("data" in response)) return null;
  const body = response.data;
  if (!body || typeof body !== "object" || !("data" in body)) return null;
  const created = body.data;
  if (!created || typeof created !== "object") return null;
  if (!("apiKey" in created) || !("id" in created) || !("keyPrefix" in created)) return null;
  if (
    typeof created.apiKey !== "string" ||
    typeof created.id !== "string" ||
    typeof created.keyPrefix !== "string"
  ) {
    return null;
  }
  return {
    id: created.id,
    apiKey: created.apiKey,
    keyPrefix: created.keyPrefix,
  };
}

export function ProjectApiKeyDialog({ open, onOpenChange, project }: ProjectApiKeyDialogProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(open);
  const projectIdRef = useRef(project?.id ?? "");
  const projectId = project?.id ?? "";
  const [plaintextKey, setPlaintextKey] = useState<string | null>(null);
  const [keyPrefix, setKeyPrefix] = useState<string | null>(null);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bootstrappedFor, setBootstrappedFor] = useState<string | null>(null);

  const keysQuery = useListProjectApiKeys(projectId, {
    query: { enabled: Boolean(project && open) },
  });

  const keys = keysQuery.data?.status === 200 ? keysQuery.data.data.data : [];
  const latestKey = keys[0] ?? null;

  useEffect(() => {
    openRef.current = open;
    projectIdRef.current = projectId;
  }, [open, projectId]);

  async function invalidateKeys() {
    if (!projectId) return;
    await queryClient.invalidateQueries({
      queryKey: getListProjectApiKeysQueryKey(projectId),
    });
  }

  const createMutation = useCreateProjectApiKey();
  const deleteMutation = useDeleteProjectApiKey();
  const { mutateAsync: createApiKey, isPending: isCreating } = createMutation;
  const { mutateAsync: deleteApiKey, isPending: isDeleting } = deleteMutation;

  function applyCreatedKey(created: { id: string; apiKey: string; keyPrefix: string }) {
    setPlaintextKey(created.apiKey);
    setKeyPrefix(created.keyPrefix);
    setActiveKeyId(created.id);
    setRevealed(false);
    setCopied(false);
  }

  async function mintKey(name = "Default") {
    if (!project) return null;

    const mintForProjectId = project.id;
    const response = await createApiKey({
      id: mintForProjectId,
      data: { name },
    });
    const created = readCreatedApiKey(response);
    if (!created) {
      throw new Error("API key was created but the secret was not returned");
    }

    await invalidateKeys();

    if (!openRef.current || projectIdRef.current !== mintForProjectId) {
      return created;
    }

    applyCreatedKey(created);
    return created;
  }

  async function deleteAllKeys() {
    if (!project) return;

    const keyIds = new Set(keys.map((key) => key.id));
    if (activeKeyId) keyIds.add(activeKeyId);

    for (const apiKeyId of keyIds) {
      await deleteApiKey({
        id: project.id,
        apiKeyId,
      });
    }

    await invalidateKeys();
  }

  useEffect(() => {
    if (!open || !project) {
      setPlaintextKey(null);
      setKeyPrefix(null);
      setActiveKeyId(null);
      setRevealed(false);
      setCopied(false);
      setBootstrappedFor(null);
      return;
    }

    if (keysQuery.isPending || keysQuery.isFetching || isCreating || isDeleting) return;
    if (bootstrappedFor === project.id) return;

    if (latestKey) {
      setKeyPrefix(latestKey.keyPrefix);
      setActiveKeyId(latestKey.id);
      setPlaintextKey(null);
      setRevealed(false);
      setCopied(false);
    } else {
      setKeyPrefix(null);
      setActiveKeyId(null);
      setPlaintextKey(null);
      setRevealed(false);
      setCopied(false);
    }

    setBootstrappedFor(project.id);
  }, [
    open,
    project,
    keysQuery.isPending,
    keysQuery.isFetching,
    isCreating,
    isDeleting,
    latestKey?.id,
    bootstrappedFor,
  ]);

  const hasPlaintext = Boolean(plaintextKey);
  const displayValue = plaintextKey ? plaintextKey : keyPrefix ? maskKey(keyPrefix) : "";
  const inputType = hasPlaintext && !revealed ? "password" : "text";
  const isBusy = keysQuery.isPending || isCreating || isDeleting;

  async function copyKey() {
    if (!plaintextKey) return;
    try {
      await copyTextToClipboard(plaintextKey, inputRef.current);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toastManager.add({
        title: "API key copied",
        type: "success",
      });
    } catch {
      toastManager.add({
        title: "Could not copy API key",
        description: "Reveal the key and copy it manually.",
        type: "error",
      });
    }
  }

  async function regenerateKey() {
    if (!project) return;

    setCopied(false);
    setRevealed(false);

    try {
      if (keys.length > 0 || activeKeyId) {
        await deleteAllKeys();
      }
      await mintKey();
    } catch {
      // Errors are surfaced via mutation.error below.
    }
  }

  const error = keysQuery.error ?? createMutation.error ?? deleteMutation.error ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>API Key</DialogTitle>
          <DialogDescription>
            Use this key to authenticate API requests for this project. The full secret is only
            shown right after you generate or regenerate a key.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="space-y-3">
            <Field className="w-full">
              <FieldLabel>API key</FieldLabel>
              <div className="flex w-full items-center gap-2">
                <Input
                  ref={inputRef}
                  readOnly
                  nativeInput
                  size="lg"
                  autoComplete="off"
                  spellCheck={false}
                  type={inputType}
                  value={displayValue}
                  placeholder={isBusy ? "Loading…" : "No API key"}
                  aria-label="API key"
                  className="min-w-0 flex-1 font-mono tracking-wide"
                />
                {hasPlaintext ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-lg"
                      aria-label={revealed ? "Hide API key" : "Show API key"}
                      onClick={() => setRevealed((value) => !value)}
                    >
                      {revealed ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-lg"
                      aria-label={copied ? "API key copied" : "Copy API key"}
                      onClick={() => void copyKey()}
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                    </Button>
                  </>
                ) : null}
              </div>
            </Field>
            {!hasPlaintext && keyPrefix ? (
              <p className="text-muted-foreground text-xs">
                Only the key prefix is stored for existing keys. Click Regenerate to mint a new key
                and copy the full secret once.
              </p>
            ) : null}
            {hasPlaintext ? (
              <p className="text-muted-foreground text-xs">
                Copy and store this key now. You won&apos;t be able to view it again later.
              </p>
            ) : null}
            {error ? (
              <p className="text-destructive text-sm">
                {getErrorMessage(error, "Failed to load API key")}
              </p>
            ) : null}
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          <Button
            loading={isCreating || isDeleting}
            disabled={!project || keysQuery.isPending}
            onClick={() => void regenerateKey()}
          >
            {keyPrefix || plaintextKey ? "Regenerate" : "Generate"}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
