import { genkit } from '@genkit-ai/googleai';
import { googleAI } from '@genkit-ai/google-genai';

const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-2.0-flash',
});

export interface GenerateScriptOptions {
  tone?: 'professional' | 'casual' | 'enthusiastic';
  duration?: 'short' | 'medium' | 'long';
}

/**
 * Generate a video script using Google's Gemini model via GenKit
 */
export async function generateScript(
  topic: string,
  options: GenerateScriptOptions = {}
): Promise<string> {
  const { tone = 'casual', duration = 'medium' } = options;

  const durationHint = {
    short: '30-45 seconds',
    medium: '45-60 seconds',
    long: '60-90 seconds',
  }[duration];

  const prompt = `Create a ${durationHint} narration script for a faceless video about: "${topic}".

Requirements:
- Tone: ${tone}
- Engaging and conversational
- Clear beginning, middle, and end
- Suitable for voiceover with stock footage
- Include visual cues in brackets [like this]

Return ONLY the script text, no additional commentary.`;

  const result = await ai.generate({
    prompt,
    model: 'gemini-2.0-flash',
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  return result.text();
}

/**
 * Generate a script with specific keywords incorporated
 */
export async function generateScriptWithKeywords(
  topic: string,
  keywords: string[]
): Promise<string> {
  const prompt = `Create a 45-60 second narration script for a faceless video about: "${topic}".

Incorporate these keywords naturally: ${keywords.join(', ')}.

Return ONLY the script text.`;

  const result = await ai.generate({
    prompt,
    model: 'gemini-2.0-flash',
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  return result.text();
}

/**
 * Generate multiple script variations for A/B testing
 */
export async function generateScriptVariations(
  topic: string,
  count: number = 3,
  options: GenerateScriptOptions = {}
): Promise<string[]> {
  const variations: string[] = [];

  for (let i = 0; i < count; i++) {
    const toneVariations: Array<'professional' | 'casual' | 'enthusiastic'> = [
      'professional',
      'casual',
      'enthusiastic',
    ];
    const tone = toneVariations[i % toneVariations.length];

    const script = await generateScript(topic, {
      ...options,
      tone,
    });
    variations.push(script);
  }

  return variations;
}