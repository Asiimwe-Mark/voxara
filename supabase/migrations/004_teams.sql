-- ======================================================
-- TEAMS & WORKSPACES SCHEMA
-- ======================================================

-- Organizations (teams/workspaces)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Organization members
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Organization subscriptions (per‑seat billing)
CREATE TABLE public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free',
  seats INTEGER DEFAULT 1,
  credits_shared INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Organization invites
CREATE TABLE public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add organization context to existing tables (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'organization_id') THEN
    -- Column already exists
  ELSE
    ALTER TABLE public.videos ADD COLUMN organization_id UUID REFERENCES public.organizations ON DELETE SET NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_organization_id') THEN
    -- Column already exists
  ELSE
    ALTER TABLE public.profiles ADD COLUMN current_organization_id UUID REFERENCES public.organizations ON DELETE SET NULL;
  END IF;
END $$;

-- ======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Organizations: members can view their orgs
CREATE POLICY "Members can view their organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = id AND user_id = auth.uid()
    )
  );

-- Organizations: owners can manage
CREATE POLICY "Owners can manage organizations" ON public.organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = id AND user_id = auth.uid() AND role = 'owner'
    )
  );

-- Organization members: members can view
CREATE POLICY "Members can view org members" ON public.organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id AND om.user_id = auth.uid()
    )
  );

-- Organization members: owners and admins can manage
CREATE POLICY "Owners and admins can manage members" ON public.organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Organization subscriptions: members can view
CREATE POLICY "Members can view subscription" ON public.organization_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organization_id AND user_id = auth.uid()
    )
  );

-- Organization invites: members can view
CREATE POLICY "Members can view invites" ON public.organization_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organization_id AND user_id = auth.uid()
    )
  );

-- Organization invites: owners and admins can manage
CREATE POLICY "Owners and admins can manage invites" ON public.organization_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ======================================================
-- FUNCTIONS
-- ======================================================

-- Create a new organization with owner
CREATE OR REPLACE FUNCTION public.create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (p_name, p_slug, p_user_id)
  RETURNING id INTO v_org_id;
  
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, p_user_id, 'owner');
  
  INSERT INTO public.organization_subscriptions (organization_id, plan, seats)
  VALUES (v_org_id, 'free', 1);
  
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Switch user's current organization
CREATE OR REPLACE FUNCTION public.switch_organization(p_organization_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Verify user is a member
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_organization_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User is not a member of this organization';
  END IF;
  
  UPDATE public.profiles
  SET current_organization_id = p_organization_id
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's accessible organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  organization_slug TEXT,
  organization_logo TEXT,
  role TEXT,
  is_current BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    o.logo_url,
    om.role,
    (p.current_organization_id = o.id) AS is_current
  FROM public.organization_members om
  JOIN public.organizations o ON o.id = om.organization_id
  LEFT JOIN public.profiles p ON p.id = p_user_id
  WHERE om.user_id = p_user_id
  ORDER BY om.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- TRIGGERS
-- ======================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organizations_updated_at') THEN
    CREATE TRIGGER update_organizations_updated_at
      BEFORE UPDATE ON public.organizations
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organization_subscriptions_updated_at') THEN
    CREATE TRIGGER update_organization_subscriptions_updated_at
      BEFORE UPDATE ON public.organization_subscriptions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ======================================================
-- INDEXES
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invites_token ON public.organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_organization_invites_email ON public.organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_organization_invites_org_id ON public.organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_current_org ON public.profiles(current_organization_id);
CREATE INDEX IF NOT EXISTS idx_videos_organization_id ON public.videos(organization_id);