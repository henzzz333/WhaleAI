import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch(
      `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Whale AI",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      reply: data.choices[0].message.content,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Whale AI encountered an error 🐋" },
      { status: 500 }
    );
  }
}
