import { createClient } from "@supabase/supabase-js";
import { beforeAll, afterAll, beforeEach } from "vitest";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Clean up test data before each test
beforeEach(async () => {
  // Delete test users and related data
  await supabase.from("profiles").delete().like("email", "test-%");
  await supabase.auth.admin.listUsers(); // Use admin API to delete test users
});