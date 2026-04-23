import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers"; // Mock this in tests

// Use service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe("Authentication Integration", () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: "TestPassword123!",
    fullName: "Test User",
  };

  afterAll(async () => {
    // Cleanup: Delete test user
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === testUser.email);
    if (user) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
  });

  it("should sign up a new user and create profile", async () => {
    const { data, error } = await supabaseAdmin.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: { full_name: testUser.fullName },
      },
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(testUser.email);

    // Verify profile was created by trigger
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user!.id)
      .single();

    expect(profile).toBeDefined();
    expect(profile.full_name).toBe(testUser.fullName);
    expect(profile.credits).toBe(3); // Default free credits
    expect(profile.plan).toBe("free");
  });

  it("should sign in an existing user", async () => {
    // First create user
    await supabaseAdmin.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: { data: { full_name: testUser.fullName } },
    });

    // Then sign in
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.session).toBeDefined();
  });

  it("should reject sign in with wrong password", async () => {
    const { error } = await supabaseAdmin.auth.signInWithPassword({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain("Invalid login credentials");
  });

  it("should send password reset email", async () => {
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(
      testUser.email,
      { redirectTo: "http://localhost:3000/reset-password/confirm" }
    );

    expect(error).toBeNull();
    // Note: In test mode, email isn't actually sent, but the operation succeeds
  });

  it("should update user profile", async () => {
    // Create and sign in user
    const { data: signUpData } = await supabaseAdmin.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: { data: { full_name: testUser.fullName } },
    });

    const userId = signUpData.user!.id;

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ full_name: "Updated Name" })
      .eq("id", userId);

    expect(error).toBeNull();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    expect(profile.full_name).toBe("Updated Name");
  });
});