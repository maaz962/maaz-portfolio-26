"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, X, Trash2, Loader2, Mail, Linkedin, ArrowRight } from "lucide-react";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/button";

interface Message {
  role: "user" | "model";
  content: string;
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What technologies does Maaz use?",
  "Tell me about his projects",
  "Can Maaz build a Flutter app?",
  "How can I hire Maaz?",
];

function TypingIndicator() {
  return (
    <div className="self-start bg-background-secondary border border-border text-foreground rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-muted/60 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-muted/60 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-muted/60 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hi! I'm Maaz's AI assistant. Ask me about his skills, projects, experience, services, or how to contact him.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client-side simple rate limit (max 12 messages per session in local storage)
  const [messageCount, setMessageCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on desktop
      if (window.innerWidth >= 768) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    if (text.length > 1000) {
      setErrorMsg("Message is too long (maximum 1000 characters).");
      return;
    }

    if (messageCount >= 20) {
      const quotaErr = "You have reached the maximum number of assistant questions for this session. Please contact Maaz directly.";
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "model", content: quotaErr, isError: true },
      ]);
      return;
    }

    // Add user message to state
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setErrorMsg(null);
    setMessageCount((prev) => prev + 1);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((prev) => [...prev, { role: "model", content: data.text }]);
    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      const fallbackMsg =
        err.message || "AI assistant is temporarily unavailable. You can contact Maaz directly on WhatsApp or email.";
      setMessages((prev) => [
        ...prev,
        { role: "model", content: fallbackMsg, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "model",
        content: "Hi! I'm Maaz's AI assistant. Ask me about his skills, projects, experience, services, or how to contact him.",
      },
    ]);
    setErrorMsg(null);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full font-medium transition-all duration-200 shadow-glow hover:brightness-110 active:scale-95 bg-primary text-primary-foreground h-11 px-5 text-sm"
            aria-label="Open AI Assistant"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Ask Maaz AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }}
            className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-32px)] sm:w-[380px] h-[550px] max-h-[85vh] flex-col rounded-2xl border border-border bg-card shadow-card overflow-hidden glass"
            role="dialog"
            aria-label="Maaz AI Assistant"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-background-secondary/45 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground leading-tight">
                    Maaz AI
                  </h3>
                  <p className="text-[10px] text-muted text-mono uppercase tracking-wider">
                    Ask me about Maaz
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {messages.length > 1 && (
                  <button
                    onClick={handleClearChat}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:text-red-500 hover:bg-background-secondary transition-colors"
                    title="Clear chat"
                    aria-label="Clear chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {messages.map((msg, index) => {
                const isModel = msg.role === "model";
                return (
                  <div key={index} className="flex flex-col space-y-1">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed max-w-[85%]",
                        isModel
                          ? msg.isError
                            ? "self-stretch text-center text-xs text-red-500 font-mono border border-red-500/20 bg-red-500/5 rounded-xl py-2 px-3 max-w-full"
                            : "self-start bg-background-secondary border border-border text-foreground rounded-tl-none"
                          : "self-end bg-primary text-primary-foreground rounded-tr-none"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isLoading && <TypingIndicator />}

              {/* Initial Suggestions & Direct Contact CTA */}
              {messages.length === 1 && !isLoading && (
                <div className="space-y-4 pt-2">
                  {/* Suggested Questions */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-mono text-muted/80 uppercase tracking-wider">
                      Suggested Questions
                    </p>
                    <div className="flex flex-col gap-2">
                      {SUGGESTED_QUESTIONS.map((question) => (
                        <button
                          key={question}
                          onClick={() => handleSendMessage(question)}
                          className="w-full text-left rounded-xl border border-border bg-card/40 px-3.5 py-2 text-xs text-muted hover:border-primary/45 hover:text-primary transition-all duration-200 text-mono"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct Contact Card */}
                  <div className="rounded-xl border border-border bg-background-secondary/35 p-3.5 space-y-2.5">
                    <p className="text-xs font-semibold text-foreground text-mono">
                      Want to talk directly with Maaz?
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {profile.whatsapp && (
                        <a
                          href={`https://wa.me/${profile.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium px-3.5 py-1.5 transition-colors shadow-sm"
                        >
                          WhatsApp Maaz
                        </a>
                      )}
                      <a
                        href={`mailto:${profile.email}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-background-secondary text-foreground hover:text-primary transition-colors px-3 py-1.5"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email Maaz
                      </a>
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-background-secondary text-foreground hover:text-primary transition-colors px-3 py-1.5"
                      >
                        View LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="bg-red-500/10 border-t border-red-500/20 px-4 py-2 text-xs text-red-500 text-mono text-center">
                {errorMsg}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t border-border bg-background-secondary/35 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                maxLength={1000}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40 transition-all duration-150"
                )}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
