import { genkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-2.0-flash',
});

export interface SEOAnalysis {
  score: number; // 0-100
  optimizedTitle: string;
  optimizedDescription: string;
  suggestedTags: string[];
  improvements: string[];
  keywordDensity: Record<string, number>;
}

export async function analyzeVideoSEO(
  title: string,
  description: string,
  script: string,
  tags: string[],
): Promise<SEOAnalysis> {
  const prompt = `You are a YouTube SEO expert. Analyze the following video metadata and script, then return a JSON object with optimization suggestions.

Title: "${title}"
Description: "${description}"
Tags: ${JSON.stringify(tags)}
Script excerpt (first 500 chars): "${script.slice(0, 500)}"

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "score": <integer 0-100 representing overall SEO strength>,
  "optimizedTitle": "<an improved, keyword-rich title under 100 chars>",
  "optimizedDescription": "<an improved description with hooks, keywords, and CTAs, 300-500 chars>",
  "suggestedTags": ["<tag1>", "<tag2>", "<tag3>", "...up to 15 tags>"],
  "improvements": ["<specific actionable improvement 1>", "<improvement 2>", "...up to 5>"],
  "keywordDensity": {"<main keyword>": <occurrence count>, "...other top keywords>": <count>}
}`;

  const result = await ai.generate({
    prompt,
    model: 'gemini-2.0-flash',
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const responseText = result.text();

  // Strip any markdown fences the model may have added
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('SEO analysis returned invalid JSON from AI model');
  }

  const parsed = JSON.parse(jsonMatch[0]) as SEOAnalysis;

  // Ensure required fields are present with safe defaults
  return {
    score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 50,
    optimizedTitle: parsed.optimizedTitle || title,
    optimizedDescription: parsed.optimizedDescription || description,
    suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags.slice(0, 15) : tags,
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
    keywordDensity:
      parsed.keywordDensity && typeof parsed.keywordDensity === 'object'
        ? parsed.keywordDensity
        : {},
  };
}