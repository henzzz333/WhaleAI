"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
    });

    if (!response.body) {
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let assistantText = "";

    // Add empty assistant message (will be filled while streaming)
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        if (line.includes("[DONE]")) continue;

        try {
          const json = JSON.parse(line.replace("data:", "").trim());
          const token = json?.choices?.[0]?.delta?.content;

          if (token) {
            assistantText += token;

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantText,
              };
              return updated;
            });
          }
        } catch {
          // ignore malformed chunks
        }
      }
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-white">
      <h1 className="text-3xl font-bold mb-4">🐋 Whale AI</h1>

      <div className="w-full max-w-2xl space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="bg-gray-200 text-black p-3 rounded-lg">
            Whale AI is thinking… 🐋
          </div>
        )}
      </div>

      <div className="flex w-full max-w-2xl gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg p-2"
          placeholder="Ask Whale AI anything..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </main>
  );
}
