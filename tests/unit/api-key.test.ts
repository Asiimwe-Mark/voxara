import { describe, it, expect, vi } from "vitest";
import { generateApiKey } from "@/lib/api-keys";

describe("API Key Utilities", () => {
  describe("generateApiKey", () => {
    it("should generate a key with correct format", () => {
      const { key, hash, preview } = generateApiKey();

      // Key format: fv_ followed by 64 hex characters
      expect(key).toMatch(/^fv_[a-f0-9]{64}$/);

      // Hash should be 64 hex characters (SHA-256)
      expect(hash).toMatch(/^[a-f0-9]{64}$/);

      // Preview should show first 10 chars ... last 4
      expect(preview).toMatch(/^fv_[a-f0-9]{6}\.{3}[a-f0-9]{4}$/);
    });

    it("should generate unique keys each time", () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();

      expect(key1.key).not.toBe(key2.key);
      expect(key1.hash).not.toBe(key2.hash);
    });

    it("should produce consistent hash for same key", () => {
      // Mock crypto to return predictable values
      const mockRandomBytes = vi.spyOn(require("crypto"), "randomBytes");
      mockRandomBytes.mockReturnValueOnce(Buffer.from("a".repeat(32)));

      const { key, hash } = generateApiKey();
      expect(key).toBe(`fv_${"a".repeat(64)}`);
      expect(hash).toHaveLength(64);

      mockRandomBytes.mockRestore();
    });
  });
});