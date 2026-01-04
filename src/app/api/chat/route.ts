import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemMessage = {
      role: "system",
      content: `
You are Whale AI 🐋.
You are friendly, intelligent, and helpful.
You explain things clearly, step by step.
Keep answers concise but useful.
`,
    };

    const response = await fetch(
      `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          stream: true,
          messages: [systemMessage, ...messages],
        }),
      }
    );

    if (!response.body) {
      return NextResponse.json({ error: "No stream available" }, { status: 500 });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Whale AI stream error:", error);
    return NextResponse.json(
      { error: "Streaming failed" },
      { status: 500 }
    );
  }
}
