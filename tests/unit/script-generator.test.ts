import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateScript, generateScriptWithKeywords } from "@/features/video/services/script-generator";

// Mock GenKit and Google AI
vi.mock("@genkit-ai/core", () => ({
  genkit: vi.fn().mockReturnValue({
    generate: vi.fn(),
  }),
}));

vi.mock("@genkit-ai/googleai", () => ({
  googleAI: vi.fn().mockReturnValue({}),
}));

const mockGenerate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  const { genkit } = require("@genkit-ai/core");
  genkit.mockReturnValue({
    generate: mockGenerate,
  });
});

describe("Script Generator with GenKit", () => {
  describe("generateScript", () => {
    it("should generate script with default options", async () => {
      mockGenerate.mockResolvedValue({
        text: () => "This is a generated script.",
      });

      const script = await generateScript("test topic");
      expect(script).toBe("This is a generated script.");
      expect(mockGenerate).toHaveBeenCalled();
    });

    it("should respect custom options", async () => {
      mockGenerate.mockResolvedValue({
        text: () => "Professional script.",
      });

      await generateScript("business topic", {
        tone: "professional",
        duration: "long",
      });

      expect(mockGenerate).toHaveBeenCalled();
    });

    it("should handle API errors gracefully", async () => {
      mockGenerate.mockRejectedValue(new Error("API rate limit"));

      await expect(generateScript("topic")).rejects.toThrow("API rate limit");
    });
  });

  describe("generateScriptWithKeywords", () => {
    it("should include keywords in the prompt", async () => {
      mockGenerate.mockResolvedValue({
        response: { text: () => "Script with keywords." },
      });

      await generateScriptWithKeywords("topic", ["keyword1", "keyword2"]);

      const prompt = mockGenerate.mock.calls[0][0];
      expect(prompt).toContain("keyword1, keyword2");
    });

    it("should return script text", async () => {
      mockGenerate.mockResolvedValue({
        response: { text: () => "Keyword optimized script." },
      });

      const result = await generateScriptWithKeywords("topic", ["seo"]);
      expect(result).toBe("Keyword optimized script.");
    });
  });
});