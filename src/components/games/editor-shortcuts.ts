"use client";

import type { KeyboardEvent } from "react";

const INDENT = "  ";
const CLOSE_PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
};

function fireInput(ta: HTMLTextAreaElement) {
  ta.dispatchEvent(new Event("input", { bubbles: true }));
}

function indentSelection(ta: HTMLTextAreaElement, forward: boolean) {
  const start = ta.selectionStart ?? ta.value.length;
  const end = ta.selectionEnd ?? ta.value.length;
  if (forward) {
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    ta.value = before + INDENT + after;
    ta.setSelectionRange(start + INDENT.length, end + INDENT.length);
  } else {
    const chunks = ta.value.slice(start, end).split("\n");
    const out = chunks.map((c) => (c.slice(0, INDENT.length) === INDENT ? c.slice(INDENT.length) : c));
    const removed = chunks.reduce((acc, c, i) => acc + (c.slice(0, INDENT.length) === INDENT && i > 0 ? INDENT.length : 0), 0);
    ta.value = ta.value.slice(0, start) + out.join("\n") + ta.value.slice(end);
    ta.setSelectionRange(Math.max(start - INDENT.length, 0), end - removed);
  }
}

function maybeAutoClose(ta: HTMLTextAreaElement, e: KeyboardEvent<HTMLTextAreaElement>) {
  const key = e.key;
  if (key.length !== 1) return;

  // Opening pair -> insert the matching closer and park the caret between them.
  const closer = CLOSE_PAIRS[key];
  if (closer) {
    const s = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    e.preventDefault();
    if (s !== end) {
      const sel = ta.value.slice(s, end);
      ta.value = ta.value.slice(0, s) + key + sel + closer + ta.value.slice(end);
      ta.setSelectionRange(s + 1, end + 1);
    } else {
      ta.value = ta.value.slice(0, s) + key + closer + ta.value.slice(s);
      ta.setSelectionRange(s + 1, s + 1);
    }
    fireInput(ta);
    return;
  }

  // Closing char already auto-inserted next to the caret -> skip over it.
  if (key === ")" || key === "]" || key === "}" || key === '"' || key === "'" || key === "`") {
    const s = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    if (s === end && ta.value[s] === key) {
      e.preventDefault();
      ta.setSelectionRange(s + 1, s + 1);
    }
  }
}

/**
 * Shared editor keyboard behavior for the engine-driven textarea games
 * (no CodeMirror): Tab/Shift-Tab indent, Ctrl/Cmd+Enter -> Run,
 * Ctrl/Cmd+Shift+Enter -> Check, auto-close brackets and quotes.
 */
export function handleEditorKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
  const ta = e.currentTarget;

  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    const btn = document.getElementById(e.shiftKey ? "check-btn" : "run-btn");
    const click = btn as HTMLButtonElement | null;
    if (click && !click.disabled) click.click();
    return;
  }

  if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    indentSelection(ta, !e.shiftKey);
    fireInput(ta);
    return;
  }

  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    maybeAutoClose(ta, e);
  }
}