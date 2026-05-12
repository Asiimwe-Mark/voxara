import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { getEnv } from '@/lib/env';

const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-2.0-flash',
});

export interface GenerateScriptOptions {
  tone?: 'professional' | 'casual' | 'enthusiastic';
  duration?: 'short' | 'medium' | 'long';
}

function getDurationHint(duration: string | undefined): string {
  const hints: Record<string, string> = {
    short: '30-45 seconds',
    medium: '45-60 seconds',
    long: '60-90 seconds',
  };
  return hints[duration ?? 'medium'] ?? '45-60 seconds';
}

function buildSystemPrompt(): string {
  return `You are an expert video script writer specializing in faceless video content (educational, informational, and promotional videos).

Your scripts should:
- Be conversational and engaging
- Include visual cues in brackets like [show image of...], [transition to...]
- Have a clear hook in the first 3 seconds
- Include natural pauses and节奏
- End with a call-to-action or summary

Format your response as a well-structured script with timing markers.`;
}

async function generateWithAI(topic: string, options: GenerateScriptOptions): Promise<string> {
  const env = getEnv();
  const apiKey = env.GOOGLE_GENAI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }

  const durationHint = getDurationHint(options.duration);
  const tone = options.tone ?? 'casual';

  const prompt = `${buildSystemPrompt()}

Create a ${durationHint} narration script for a faceless video about: "${topic}".

Requirements:
- Tone: ${tone}
- Duration: ${durationHint}
- Include visual cues in brackets [show...]
- Make it engaging and ready to narrate

Write only the script content, no explanations:`;

  const result = await ai.generate({
    prompt,
    model: 'gemini-2.0-flash',
    config: {
      temperature: 0.8,
      maxOutputTokens: 2048,
    },
  });

  const resultAny = result as unknown as { text?: (() => string) | string; output?: string };
  let responseText = '';
  if (resultAny.text) {
    if (typeof resultAny.text === 'function') {
      responseText = resultAny.text();
    } else {
      responseText = resultAny.text;
    }
  } else if (resultAny.output) {
    responseText = resultAny.output;
  }

  if (!responseText) {
    throw new Error('No response from AI model');
  }

  return responseText.trim();
}

/**
 * Generate a video script using AI.
 */
export async function generateScript(
  topic: string,
  options: GenerateScriptOptions = {}
): Promise<string> {
  if (!topic || topic.trim().length === 0) {
    throw new Error('Topic is required');
  }

  return generateWithAI(topic.trim(), options);
}

/**
 * Generate a script with specific keywords incorporated
 */
export async function generateScriptWithKeywords(
  topic: string,
  keywords: string[]
): Promise<string> {
  if (!topic || topic.trim().length === 0) {
    throw new Error('Topic is required');
  }
  if (!keywords || keywords.length === 0) {
    return generateScript(topic, {});
  }

  const env = getEnv();
  const apiKey = env.GOOGLE_GENAI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }

  const prompt = `${buildSystemPrompt()}

Create a 45-60 second narration script for a faceless video about: "${topic}".

Requirements:
- Naturally incorporate these keywords: ${keywords.join(', ')}
- Include visual cues in brackets [show...]
- Make it engaging and ready to narrate

Write only the script content, no explanations:`;

  const result = await ai.generate({
    prompt,
    model: 'gemini-2.0-flash',
    config: {
      temperature: 0.8,
      maxOutputTokens: 2048,
    },
  });

  const resultAny = result as unknown as { text?: (() => string) | string; output?: string };
  let responseText = '';
  if (resultAny.text) {
    if (typeof resultAny.text === 'function') {
      responseText = resultAny.text();
    } else {
      responseText = resultAny.text;
    }
  } else if (resultAny.output) {
    responseText = resultAny.output;
  }

  return responseText.trim();
}

/**
 * Generate multiple script variations for A/B testing
 */
export async function generateScriptVariations(
  topic: string,
  count: number = 3,
  options: GenerateScriptOptions = {}
): Promise<string[]> {
  if (!topic || topic.trim().length === 0) {
    throw new Error('Topic is required');
  }

  const tones: Array<'professional' | 'casual' | 'enthusiastic'> = [
    'professional',
    'casual',
    'enthusiastic',
  ];

  const variations: string[] = [];
  for (let i = 0; i < count; i++) {
    const tone = tones[i % tones.length];
    try {
      const script = await generateWithAI(topic, { ...options, tone });
      variations.push(script);
    } catch (error) {
      variations.push(`[${tone.charAt(0).toUpperCase() + tone.slice(1)} tone] Script for: ${topic}`);
    }
  }

  return variations;
}