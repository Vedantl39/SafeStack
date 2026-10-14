import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Small, fast, inexpensive model by default. Override with CLAUDE_MODEL if needed.
const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-5-5";

export async function askClaude(
  prompt: string,
  options: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

// Claude sometimes wraps JSON in ```json fences or adds a sentence around it.
// Pull out the JSON object so JSON.parse works.
export function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}
