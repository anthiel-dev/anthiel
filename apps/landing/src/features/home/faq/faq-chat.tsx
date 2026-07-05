import { ArrowUpIcon } from "lucide-react";
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type ReactNode,
  type FormEvent,
} from "react";

import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Bubble, BubbleContent } from "#components/ui/bubble";
import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Message, MessageAvatar, MessageContent } from "#components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "#components/ui/message-scroller";
import { cn } from "#lib/utils";

import type { ChatMessage, FaqItem } from "./types";

import {
  ANSWER_REVEAL_DELAY_MS,
  customQueryAcknowledged,
  customQueryAcknowledgedText,
  customQueryConfirmed,
  customQueryConfirmedText,
  customQueryEmailPrompt,
  customQueryEmailPromptText,
  faqs,
  INITIAL_SUGGESTION_COUNT,
  invalidEmailReply,
  invalidEmailReplyText,
  SUGGESTION_COUNT,
} from "./data";
import { FaqChip } from "./faq-chip";
import { FaqStreamingContent } from "./faq-streaming-content";
import { FaqTypingIndicator } from "./faq-typing-indicator";
import { isValidEmail, refillSuggestions } from "./utils";

function FaqMessageBubble({
  message,
  prefersReducedMotion,
  onStreamComplete,
  onStreamProgress,
}: {
  message: ChatMessage;
  prefersReducedMotion: boolean;
  onStreamComplete: (messageId: string) => void;
  onStreamProgress: () => void;
}) {
  const status = message.status ?? "complete";

  if (status === "typing") {
    return <FaqTypingIndicator />;
  }

  if (status === "streaming" && message.streamText && message.content !== undefined) {
    return (
      <FaqStreamingContent
        text={message.streamText}
        finalContent={message.content}
        enabled={!prefersReducedMotion}
        onComplete={() => onStreamComplete(message.id)}
        onProgress={onStreamProgress}
      />
    );
  }

  return <>{message.content}</>;
}

function FaqChatMessages({
  messages,
  prefersReducedMotion,
  onStreamComplete,
}: {
  messages: ChatMessage[];
  prefersReducedMotion: boolean;
  onStreamComplete: (messageId: string) => void;
}) {
  const scroller = useMessageScroller();

  const handleStreamProgress = useCallback(() => {
    scroller.scrollToEnd({ behavior: "smooth" });
  }, [scroller]);

  return (
    <>
      {messages.map((message) => {
        const status = message.status ?? "complete";
        const isAssistantReply = message.role === "assistant" && status !== "complete";

        return (
          <MessageScrollerItem
            key={message.id}
            messageId={message.id}
            scrollAnchor={message.role === "user" || isAssistantReply}
          >
            <Message
              align={message.role === "user" ? "end" : "start"}
              className={cn(
                message.isNew && "chat-message-enter",
                message.isNew && message.role === "user" && "chat-message-enter-user",
                message.isNew && message.role === "assistant" && "chat-message-enter-answer",
              )}
            >
              {message.role === "assistant" ? (
                <MessageAvatar>
                  <Avatar className="size-8 bg-orange-500/15 text-orange-400">
                    <AvatarFallback className="bg-transparent text-[10px] font-semibold">
                      A
                    </AvatarFallback>
                  </Avatar>
                </MessageAvatar>
              ) : null}
              <MessageContent>
                <Bubble variant={message.role === "user" ? "default" : "muted"}>
                  <BubbleContent className="text-xs leading-relaxed">
                    <FaqMessageBubble
                      message={message}
                      prefersReducedMotion={prefersReducedMotion}
                      onStreamComplete={onStreamComplete}
                      onStreamProgress={handleStreamProgress}
                    />
                  </BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          </MessageScrollerItem>
        );
      })}
    </>
  );
}

export function FaqChat() {
  const inputId = useId();
  const answerTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! Ask us anything about Anthiel or pick a question below.",
      status: "complete",
    },
  ]);
  const [askedFaqIds, setAskedFaqIds] = useState<Set<string>>(() => new Set());
  const [visibleSuggestionIds, setVisibleSuggestionIds] = useState<string[]>(() =>
    faqs.slice(0, INITIAL_SUGGESTION_COUNT).map((faq) => faq.id),
  );
  const [draft, setDraft] = useState("");
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    return () => {
      if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current);
    };
  }, []);

  const completeMessage = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, status: "complete" } : message,
      ),
    );
  }, []);

  const askQuestion = useCallback(
    (question: string, answer: ReactNode, streamText?: string) => {
      const turnId = crypto.randomUUID();
      const userId = `${turnId}-user`;
      const assistantId = `${turnId}-assistant`;
      const text = streamText ?? (typeof answer === "string" ? answer : undefined);
      const shouldAnimate = !prefersReducedMotion && Boolean(text);

      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: question, isNew: true },
        {
          id: assistantId,
          role: "assistant",
          status: shouldAnimate ? "typing" : "complete",
          content: shouldAnimate ? undefined : answer,
          streamText: text,
          isNew: true,
        },
      ]);

      if (!shouldAnimate) return;

      if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current);

      answerTimeoutRef.current = setTimeout(() => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  status: "streaming",
                  content: answer,
                }
              : message,
          ),
        );
      }, ANSWER_REVEAL_DELAY_MS);
    },
    [prefersReducedMotion],
  );

  const markFaqAsked = useCallback((faqId: string) => {
    setAskedFaqIds((prev) => {
      const asked = new Set(prev).add(faqId);
      setVisibleSuggestionIds((visible) =>
        refillSuggestions(visible, asked, faqId, SUGGESTION_COUNT),
      );
      return asked;
    });
  }, []);

  const handleFaqClick = useCallback(
    (faq: FaqItem) => {
      if (askedFaqIds.has(faq.id)) return;
      askQuestion(faq.question, faq.answer, faq.streamText);
      markFaqAsked(faq.id);
    },
    [askQuestion, askedFaqIds, markFaqAsked],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = draft.trim();
      if (!value) return;

      if (awaitingEmail) {
        if (!isValidEmail(value)) {
          askQuestion(value, invalidEmailReply, invalidEmailReplyText);
          setDraft("");
          return;
        }

        askQuestion(value, customQueryConfirmed, customQueryConfirmedText);
        setCapturedEmail(value);
        setAwaitingEmail(false);
        setDraft("");
        return;
      }

      const matchedFaq = faqs.find((faq) => faq.question.toLowerCase() === value.toLowerCase());

      if (matchedFaq && !askedFaqIds.has(matchedFaq.id)) {
        askQuestion(matchedFaq.question, matchedFaq.answer, matchedFaq.streamText);
        markFaqAsked(matchedFaq.id);
      } else if (capturedEmail) {
        askQuestion(value, customQueryAcknowledged, customQueryAcknowledgedText);
      } else {
        askQuestion(value, customQueryEmailPrompt, customQueryEmailPromptText);
        setAwaitingEmail(true);
      }

      setDraft("");
    },
    [askQuestion, askedFaqIds, awaitingEmail, capturedEmail, draft, markFaqAsked],
  );

  const isAssistantBusy = messages.some(
    (message) =>
      message.role === "assistant" &&
      (message.status === "typing" || message.status === "streaming"),
  );

  const inputPlaceholder = awaitingEmail ? "your@email.com" : "Type your own question...";
  const inputLabel = awaitingEmail ? "Your email address" : "Ask a question";

  const visibleSuggestions = visibleSuggestionIds
    .map((id) => faqs.find((faq) => faq.id === id))
    .filter((faq): faq is FaqItem => faq !== undefined);
  const showSuggestions = visibleSuggestions.length > 0;

  return (
    <div className="mt-4 flex flex-col overflow-hidden rounded-2xl border border-card bg-card/20">
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <MessageScroller className="h-[min(300px,55vh)]">
          <MessageScrollerViewport>
            <MessageScrollerContent
              className="gap-4 px-4 py-4"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              <FaqChatMessages
                messages={messages}
                prefersReducedMotion={prefersReducedMotion}
                onStreamComplete={completeMessage}
              />
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {showSuggestions ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-card px-4 py-3">
          {visibleSuggestions.map((faq) => (
            <FaqChip key={faq.id} faq={faq} onSelect={handleFaqClick} disabled={isAssistantBusy} />
          ))}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-card px-4 py-3"
      >
        <label htmlFor={inputId} className="sr-only">
          {inputLabel}
        </label>
        <Input
          id={inputId}
          type={awaitingEmail ? "email" : "text"}
          inputMode={awaitingEmail ? "email" : undefined}
          autoComplete={awaitingEmail ? "email" : "off"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={inputPlaceholder}
          className="text-xs"
          size="lg"
          disabled={isAssistantBusy}
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={!draft.trim() || isAssistantBusy}
          aria-label="Send message"
        >
          <ArrowUpIcon />
        </Button>
      </form>
    </div>
  );
}
