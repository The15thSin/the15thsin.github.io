export function createBanner(text) {
  return {
    id: crypto.randomUUID(),
    type: "banner",
    text,
  };
}

export function createInfo(text) {
  return {
    id: crypto.randomUUID(),
    type: "info",
    text,
  };
}

export function createVibe(text) {
  return {
    id: crypto.randomUUID(),
    type: "vibe",
    text,
  };
}

export function createError(text) {
  return {
    id: crypto.randomUUID(),
    type: "error",
    text,
  };
}

export function createAssistant(text = "") {
  return {
    id: crypto.randomUUID(),
    type: "assistant",
    text,
  };
}

export function createCommand(command, prompt = "ayush@portfolio:~$") {
  return {
    id: crypto.randomUUID(),
    type: "command",
    text: {
      prompt,
      command,
    },
  };
}

export function updateLastHistory(history, text) {
  if (!history.length) return history;

  const copy = [...history];

  copy[copy.length - 1] = {
    ...copy[copy.length - 1],
    text,
  };

  return copy;
}