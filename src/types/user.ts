import type { PlanType } from "./billing";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
  plan: PlanType;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface OrganizationInvite {
  id: string;
  organization_id: string;
  email: string;
  role: "admin" | "member";
  invited_by: string | null;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  stripe_subscription_id: string | null;
  plan: PlanType;
  seats: number;
  credits_shared: number;
  status: string;
  current_period_end: string | null;
  created_at: string;
}