import { useState } from "react";

import { streamChat } from "../services/chatService";
import { BANNER } from "../constants/banner";

import {
  createAssistant,
  createBanner,
  createCommand,
  createError,
  createInfo,
  createVibe,
  updateLastHistory,
} from "../utils/history";

export default function useChat(backendReady) {
  const [history, setHistory] = useState([
    createBanner(BANNER),
    createInfo("Welcome to Ayush Jalan's portfolio."),
    createVibe(
      "Completely vibe coded portfolio -> feels slick and immersive."
    ),
    createInfo(
      "Claude Code-style assistant is ready!!! Send a command below..."
    ),
    createInfo(" "),
  ]);

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [thinking, setThinking] = useState(null);

  function addHistory(item) {
    setHistory((prev) => [...prev, item]);
  }

  function updateAssistant(text) {
    setHistory((prev) => updateLastHistory(prev, text));
  }

  async function sendCommand() {
    if (!input.trim()) return;

    if (!backendReady) {
      addHistory(
        createInfo(
          "Backend is still starting. Please wait..."
        )
      );
      return;
    }

    const command = input.trim();

    addHistory(createCommand(command));

    setInput("");

    setThinking("");

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: command,
      },
    ];

    setMessages(updatedMessages);

    //
    // Empty assistant placeholder
    //
    addHistory(createAssistant(""));

    try {
      let firstOutputToken = true;

      const assistantReply = await streamChat({
        messages: updatedMessages,

        onThinking: setThinking,

        onToken: (text) => {
          if (firstOutputToken) {
            firstOutputToken = false;
            setThinking(null);
          }

          updateAssistant(text);
        },

        onDone: (reply) => {
          setThinking(null);

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: reply,
            },
          ]);
        },

        onError: () => {
          addHistory(
            createError(
              "Error: Unable to reach backend endpoint."
            )
          );
        },
      });

      return assistantReply;

    } catch (err) {
      console.error(err);

      setThinking(null);
    }
  }

  return {
    history,

    input,
    setInput,

    thinking,

    messages,

    sendCommand,
  };
}