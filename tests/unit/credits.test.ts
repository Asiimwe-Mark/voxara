import { describe, it, expect, vi, beforeEach } from "vitest";
import { deductCredits, addCredits } from "@/lib/credits";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
  rpc: vi.fn(),
};

vi.mocked(require("@/lib/supabase/server").createClient).mockResolvedValue(mockSupabase);

describe("Credit Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deductCredits", () => {
    it("should return true and deduct when sufficient credits", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { credits: 10 },
        error: null,
      });

      const result = await deductCredits("user-123", 3);
      expect(result).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalledWith({ credits: 7 });
    });

    it("should return false when insufficient credits", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { credits: 2 },
        error: null,
      });

      const result = await deductCredits("user-123", 5);
      expect(result).toBe(false);
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it("should handle profile not found", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" },
      });

      const result = await deductCredits("user-123", 1);
      expect(result).toBe(false);
    });

    it("should default to deducting 1 credit", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { credits: 5 },
        error: null,
      });

      await deductCredits("user-123");
      expect(mockSupabase.update).toHaveBeenCalledWith({ credits: 4 });
    });
  });

  describe("addCredits", () => {
    it("should call RPC to add credits", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({ error: null });

      await addCredits("user-123", 10);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("add_credits", {
        p_user_id: "user-123",
        p_credits: 10,
      });
    });

    it("should throw error if RPC fails", async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        error: { message: "RPC error" },
      });

      await expect(addCredits("user-123", 5)).rejects.toThrow();
    });
  });
});