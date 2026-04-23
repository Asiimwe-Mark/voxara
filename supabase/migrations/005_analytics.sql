-- ======================================================
-- ANALYTICS SCHEMA: VIDEO METRICS, VIEWER SESSIONS, AGGREGATION
-- ======================================================

-- Video performance metrics (daily aggregation)
CREATE TABLE public.video_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  average_view_percentage DECIMAL(5,2) DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  retention_30s INTEGER DEFAULT 0,
  retention_60s INTEGER DEFAULT 0,
  retention_complete INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(video_id, date)
);

-- Viewer session tracking (raw events)
CREATE TABLE public.viewer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  viewer_id TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  watch_duration INTEGER DEFAULT 0,
  watch_percentage DECIMAL(5,2) DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  country TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  playback_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- A/B test experiments
CREATE TABLE public.ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  variants JSONB NOT NULL,
  winner_variant_id TEXT,
  confidence_level DECIMAL(5,2),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- A/B test impressions
CREATE TABLE public.ab_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ab_experiments ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  impression_time TIMESTAMPTZ NOT NULL,
  clicked BOOLEAN DEFAULT false,
  click_time TIMESTAMPTZ,
  watched_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SEO performance tracking
CREATE TABLE public.seo_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  keyword_rankings JSONB DEFAULT '{}'::jsonb,
  search_impressions INTEGER DEFAULT 0,
  search_clicks INTEGER DEFAULT 0,
  search_ctr DECIMAL(5,2) DEFAULT 0,
  average_position DECIMAL(5,2),
  title_score INTEGER,
  description_score INTEGER,
  tags_score INTEGER,
  overall_seo_score INTEGER,
  suggestions JSONB DEFAULT '[]'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================
ALTER TABLE public.video_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_performance ENABLE ROW LEVEL SECURITY;

-- Video metrics: users see only their own
CREATE POLICY "Users can view own video metrics" ON public.video_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- Viewer sessions: users see sessions for their videos
CREATE POLICY "Users can view own viewer sessions" ON public.viewer_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.videos
      WHERE id = video_id AND user_id = auth.uid()
    )
  );

-- A/B experiments: users manage their own
CREATE POLICY "Users can manage own A/B experiments" ON public.ab_experiments
  FOR ALL USING (auth.uid() = user_id);

-- A/B impressions: users see impressions for their experiments
CREATE POLICY "Users can view own A/B impressions" ON public.ab_impressions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ab_experiments
      WHERE id = experiment_id AND user_id = auth.uid()
    )
  );

-- SEO performance: users see their own
CREATE POLICY "Users can view own SEO performance" ON public.seo_performance
  FOR SELECT USING (auth.uid() = user_id);

-- ======================================================
-- FUNCTIONS & AGGREGATION HELPERS
-- ======================================================

-- Aggregate daily metrics from viewer sessions (can be called by cron)
CREATE OR REPLACE FUNCTION public.aggregate_daily_metrics(p_date DATE DEFAULT (CURRENT_DATE - INTERVAL '1 day'))
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT video_id
    FROM public.viewer_sessions
    WHERE start_time >= p_date
      AND start_time < p_date + INTERVAL '1 day'
  LOOP
    WITH session_stats AS (
      SELECT
        video_id,
        COUNT(*) as views,
        COUNT(DISTINCT viewer_id) as unique_viewers,
        COALESCE(SUM(watch_duration), 0) as total_watch_time,
        COALESCE(AVG(watch_percentage), 0) as avg_percentage,
        COUNT(*) FILTER (WHERE playback_events @> '[{"type": "click"}]') as clicks,
        COUNT(*) FILTER (WHERE watch_duration >= 30) as ret_30,
        COUNT(*) FILTER (WHERE watch_duration >= 60) as ret_60,
        COUNT(*) FILTER (WHERE watch_percentage >= 95) as ret_complete
      FROM public.viewer_sessions
      WHERE video_id = r.video_id
        AND start_time >= p_date
        AND start_time < p_date + INTERVAL '1 day'
    ),
    video_owner AS (
      SELECT user_id FROM public.videos WHERE id = r.video_id
    )
    INSERT INTO public.video_metrics (
      video_id,
      user_id,
      date,
      views,
      unique_viewers,
      watch_time_seconds,
      average_view_percentage,
      clicks,
      ctr,
      retention_30s,
      retention_60s,
      retention_complete
    )
    SELECT
      ss.video_id,
      vo.user_id,
      p_date,
      ss.views,
      ss.unique_viewers,
      ss.total_watch_time,
      ROUND(ss.avg_percentage, 2),
      ss.clicks,
      CASE WHEN ss.views > 0 THEN ROUND((ss.clicks::DECIMAL / ss.views) * 100, 2) ELSE 0 END,
      ss.ret_30,
      ss.ret_60,
      ss.ret_complete
    FROM session_stats ss
    CROSS JOIN video_owner vo
    ON CONFLICT (video_id, date) DO UPDATE SET
      views = EXCLUDED.views,
      unique_viewers = EXCLUDED.unique_viewers,
      watch_time_seconds = EXCLUDED.watch_time_seconds,
      average_view_percentage = EXCLUDED.average_view_percentage,
      clicks = EXCLUDED.clicks,
      ctr = EXCLUDED.ctr,
      retention_30s = EXCLUDED.retention_30s,
      retention_60s = EXCLUDED.retention_60s,
      retention_complete = EXCLUDED.retention_complete,
      updated_at = now();
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean old viewer sessions (retain for 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.viewer_sessions
  WHERE created_at < NOW() - INTERVAL '90 days'
  RETURNING COUNT(*) INTO v_deleted;
  
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- TRIGGERS
-- ======================================================
CREATE TRIGGER update_video_metrics_updated_at
  BEFORE UPDATE ON public.video_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ======================================================
-- INDEXES
-- ======================================================
CREATE INDEX idx_video_metrics_video_id ON public.video_metrics(video_id);
CREATE INDEX idx_video_metrics_user_id ON public.video_metrics(user_id);
CREATE INDEX idx_video_metrics_date ON public.video_metrics(date);
CREATE INDEX idx_video_metrics_composite ON public.video_metrics(user_id, date);

CREATE INDEX idx_viewer_sessions_video_id ON public.viewer_sessions(video_id);
CREATE INDEX idx_viewer_sessions_session_id ON public.viewer_sessions(session_id);
CREATE INDEX idx_viewer_sessions_start_time ON public.viewer_sessions(start_time);
CREATE INDEX idx_viewer_sessions_created_at ON public.viewer_sessions(created_at);

CREATE INDEX idx_ab_experiments_user_id ON public.ab_experiments(user_id);
CREATE INDEX idx_ab_experiments_video_id ON public.ab_experiments(video_id);
CREATE INDEX idx_ab_experiments_status ON public.ab_experiments(status);

CREATE INDEX idx_ab_impressions_experiment_id ON public.ab_impressions(experiment_id);
CREATE INDEX idx_ab_impressions_variant_id ON public.ab_impressions(variant_id);

CREATE INDEX idx_seo_performance_video_id ON public.seo_performance(video_id);
CREATE INDEX idx_seo_performance_user_id ON public.seo_performance(user_id);