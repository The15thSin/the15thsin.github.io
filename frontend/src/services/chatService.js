import { BACKEND_ENDPOINT } from "../constants/config";

export async function streamChat({
  messages,
  onThinking,
  onToken,
  onError,
  onDone,
}) {
  let assistantReply = "";
  let thinkingText = "";
  let firstAssistantToken = false;

  try {
    const response = await fetch(`${BACKEND_ENDPOINT}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
      },
      body: JSON.stringify({
        messages,
        max_tokens: 8192,
        temperature: 1.0,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    if (!response.body) {
      throw new Error("Response stream unavailable.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true,
      });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        processLine(line);
      }
    }

    if (buffer.trim()) {
      processLine(buffer);
    }

    onDone?.(assistantReply);

    return assistantReply;

  } catch (err) {
    console.error(err);

    onError?.(err);

    throw err;
  }

  function processLine(line) {
    if (!line.trim()) return;

    try {
      const obj = JSON.parse(line);

      //
      // Thinking stream
      //
      if ("1" in obj && !firstAssistantToken) {
        thinkingText += obj["1"];
        onThinking?.(thinkingText);
      }

      //
      // Assistant stream
      //
      if ("0" in obj) {

        if (!firstAssistantToken) {
          firstAssistantToken = true;
          onThinking?.("");
        }

        assistantReply += obj["0"];

        onToken?.(assistantReply);
      }

    } catch (err) {
      console.error("Invalid NDJSON:", line);
    }
  }
}