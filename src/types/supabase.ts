export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ab_experiments: {
        Row: {
          confidence_level: number | null
          created_at: string | null
          end_time: string | null
          id: string
          metrics: Json | null
          name: string
          start_time: string
          status: string | null
          type: string
          user_id: string
          variants: Json
          video_id: string
          winner_variant_id: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          metrics?: Json | null
          name: string
          start_time: string
          status?: string | null
          type: string
          user_id: string
          variants: Json
          video_id: string
          winner_variant_id?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          start_time?: string
          status?: string | null
          type?: string
          user_id?: string
          variants?: Json
          video_id?: string
          winner_variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_experiments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_impressions: {
        Row: {
          click_time: string | null
          clicked: boolean | null
          created_at: string | null
          experiment_id: string | null
          id: string
          impression_time: string
          session_id: string
          variant_id: string
          watched_duration: number | null
        }
        Insert: {
          click_time?: string | null
          clicked?: boolean | null
          created_at?: string | null
          experiment_id?: string | null
          id?: string
          impression_time: string
          session_id: string
          variant_id: string
          watched_duration?: number | null
        }
        Update: {
          click_time?: string | null
          clicked?: boolean | null
          created_at?: string | null
          experiment_id?: string | null
          id?: string
          impression_time?: string
          session_id?: string
          variant_id?: string
          watched_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_impressions_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_preview: string
          last_used_at: string | null
          name: string
          permissions: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_preview: string
          last_used_at?: string | null
          name: string
          permissions?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_preview?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auto_top_up_settings: {
        Row: {
          enabled: boolean | null
          id: string
          threshold: number | null
          top_up_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          enabled?: boolean | null
          id?: string
          threshold?: number | null
          top_up_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          enabled?: boolean | null
          id?: string
          threshold?: number | null
          top_up_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_packs: {
        Row: {
          active: boolean | null
          created_at: string | null
          credits: number
          id: string
          name: string
          price_amount: number
          provider_price_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          credits: number
          id?: string
          name: string
          price_amount: number
          provider_price_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          credits?: number
          id?: string
          name?: string
          price_amount?: number
          provider_price_id?: string | null
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          credit_pack_id: string | null
          credits_purchased: number | null
          id: string
          payment_intent_id: string | null
          provider: string | null
          provider_tx_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          credit_pack_id?: string | null
          credits_purchased?: number | null
          id?: string
          payment_intent_id?: string | null
          provider?: string | null
          provider_tx_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          credit_pack_id?: string | null
          credits_purchased?: number | null
          id?: string
          payment_intent_id?: string | null
          provider?: string | null
          provider_tx_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_credit_pack_id_fkey"
            columns: ["credit_pack_id"]
            isOneToOne: false
            referencedRelation: "credit_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string | null
          organization_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          organization_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          organization_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          created_at: string | null
          credits_shared: number | null
          current_period_end: string | null
          id: string
          organization_id: string
          plan: string | null
          seats: number | null
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_shared?: number | null
          current_period_end?: string | null
          id?: string
          organization_id: string
          plan?: string | null
          seats?: number | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_shared?: number | null
          current_period_end?: string | null
          id?: string
          organization_id?: string
          plan?: string | null
          seats?: number | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_customers: {
        Row: {
          created_at: string | null
          flutterwave_customer_id: string | null
          id: string
          metadata: Json | null
          paddle_customer_id: string | null
          payment_customer_id: string | null
          provider: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          flutterwave_customer_id?: string | null
          id?: string
          metadata?: Json | null
          paddle_customer_id?: string | null
          payment_customer_id?: string | null
          provider?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          flutterwave_customer_id?: string | null
          id?: string
          metadata?: Json | null
          paddle_customer_id?: string | null
          payment_customer_id?: string | null
          provider?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_sessions: {
        Row: {
          created_at: string | null
          credits: number | null
          id: number
          metadata: Json | null
          plan_type: string | null
          provider: string | null
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits?: number | null
          id?: number
          metadata?: Json | null
          plan_type?: string | null
          provider?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number | null
          id?: number
          metadata?: Json | null
          plan_type?: string | null
          provider?: string | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          metadata: Json | null
          plan: string | null
          provider: string | null
          provider_subscription_id: string | null
          status: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          metadata?: Json | null
          plan?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          metadata?: Json | null
          plan?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pending_credit_purchases: {
        Row: {
          created_at: string | null
          credits_pending: number
          id: number
          metadata: Json | null
          provider: string | null
          status: string | null
          tx_ref: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_pending: number
          id?: number
          metadata?: Json | null
          provider?: string | null
          status?: string | null
          tx_ref?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_pending?: number
          id?: number
          metadata?: Json | null
          provider?: string | null
          status?: string | null
          tx_ref?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          credits: number | null
          current_organization_id: string | null
          email: string | null
          full_name: string | null
          id: string
          plan: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          credits?: number | null
          current_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          credits?: number | null
          current_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      publishing_schedules: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          platform: string
          scheduled_at: string
          status: string | null
          title: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          platform: string
          scheduled_at: string
          status?: string | null
          title?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          platform?: string
          scheduled_at?: string
          status?: string | null
          title?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publishing_schedules_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_performance: {
        Row: {
          average_position: number | null
          checked_at: string | null
          description_score: number | null
          id: string
          keyword_rankings: Json | null
          overall_seo_score: number | null
          search_clicks: number | null
          search_ctr: number | null
          search_impressions: number | null
          suggestions: Json | null
          tags_score: number | null
          title_score: number | null
          user_id: string
          video_id: string
        }
        Insert: {
          average_position?: number | null
          checked_at?: string | null
          description_score?: number | null
          id?: string
          keyword_rankings?: Json | null
          overall_seo_score?: number | null
          search_clicks?: number | null
          search_ctr?: number | null
          search_impressions?: number | null
          suggestions?: Json | null
          tags_score?: number | null
          title_score?: number | null
          user_id: string
          video_id: string
        }
        Update: {
          average_position?: number | null
          checked_at?: string | null
          description_score?: number | null
          id?: string
          keyword_rankings?: Json | null
          overall_seo_score?: number | null
          search_clicks?: number | null
          search_ctr?: number | null
          search_impressions?: number | null
          suggestions?: Json | null
          tags_score?: number | null
          title_score?: number | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_performance_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          account_id: string | null
          account_name: string | null
          created_at: string | null
          id: string
          platform: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          id?: string
          platform?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          id?: string
          platform?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_share_monthly_limits: {
        Row: {
          credits_earned: number | null
          id: string
          month: string
          user_id: string
        }
        Insert: {
          credits_earned?: number | null
          id?: string
          month: string
          user_id: string
        }
        Update: {
          credits_earned?: number | null
          id?: string
          month?: string
          user_id?: string
        }
        Relationships: []
      }
      social_shares: {
        Row: {
          created_at: string | null
          credits_awarded: number | null
          id: string
          platform: string
          share_url: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          credits_awarded?: number | null
          id?: string
          platform: string
          share_url?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          credits_awarded?: number | null
          id?: string
          platform?: string
          share_url?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_shares_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          id: string
          stripe_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stripe_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stripe_customer_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_avatars: {
        Row: {
          avatar_model_id: string | null
          created_at: string | null
          gender: string | null
          heygen_task_id: string | null
          id: string
          image_url: string | null
          name: string
          polling_canceled: boolean | null
          provider: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_model_id?: string | null
          created_at?: string | null
          gender?: string | null
          heygen_task_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          polling_canceled?: boolean | null
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_model_id?: string | null
          created_at?: string | null
          gender?: string | null
          heygen_task_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          polling_canceled?: boolean | null
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_voices: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sample_audio_url: string | null
          status: string | null
          user_id: string
          voice_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sample_audio_url?: string | null
          status?: string | null
          user_id: string
          voice_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sample_audio_url?: string | null
          status?: string | null
          user_id?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      video_metrics: {
        Row: {
          average_view_percentage: number | null
          clicks: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          retention_30s: number | null
          retention_60s: number | null
          retention_complete: number | null
          unique_viewers: number | null
          updated_at: string | null
          user_id: string
          video_id: string
          views: number | null
          watch_time_seconds: number | null
        }
        Insert: {
          average_view_percentage?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          id?: string
          retention_30s?: number | null
          retention_60s?: number | null
          retention_complete?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
          user_id: string
          video_id: string
          views?: number | null
          watch_time_seconds?: number | null
        }
        Update: {
          average_view_percentage?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          retention_30s?: number | null
          retention_60s?: number | null
          retention_complete?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
          views?: number | null
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_metrics_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_publishes: {
        Row: {
          created_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          platform: string
          published_at: string | null
          status: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          platform: string
          published_at?: string | null
          status?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          platform?: string
          published_at?: string | null
          status?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_publishes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_templates: {
        Row: {
          category: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          downloads: number | null
          id: string
          name: string
          preview_url: string | null
          price: number | null
          rating: number | null
          status: string | null
          template_data: Json | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          downloads?: number | null
          id?: string
          name: string
          preview_url?: string | null
          price?: number | null
          rating?: number | null
          status?: string | null
          template_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          downloads?: number | null
          id?: string
          name?: string
          preview_url?: string | null
          price?: number | null
          rating?: number | null
          status?: string | null
          template_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          avatar_id: string | null
          created_at: string | null
          id: string
          mux_playback_id: string | null
          organization_id: string | null
          published_at: string | null
          script: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          voice_id: string | null
          webhook_url: string | null
          youtube_id: string | null
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string | null
          id?: string
          mux_playback_id?: string | null
          organization_id?: string | null
          published_at?: string | null
          script?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          voice_id?: string | null
          webhook_url?: string | null
          youtube_id?: string | null
        }
        Update: {
          avatar_id?: string | null
          created_at?: string | null
          id?: string
          mux_playback_id?: string | null
          organization_id?: string | null
          published_at?: string | null
          script?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          voice_id?: string | null
          webhook_url?: string | null
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "user_avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_voice_id_fkey"
            columns: ["voice_id"]
            isOneToOne: false
            referencedRelation: "user_voices"
            referencedColumns: ["id"]
          },
        ]
      }
      viewer_sessions: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          end_time: string | null
          id: string
          playback_events: Json | null
          referrer: string | null
          session_id: string
          start_time: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          video_id: string
          viewer_id: string | null
          watch_duration: number | null
          watch_percentage: number | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          end_time?: string | null
          id?: string
          playback_events?: Json | null
          referrer?: string | null
          session_id: string
          start_time: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          video_id: string
          viewer_id?: string | null
          watch_duration?: number | null
          watch_percentage?: number | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          end_time?: string | null
          id?: string
          playback_events?: Json | null
          referrer?: string | null
          session_id?: string
          start_time?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          video_id?: string
          viewer_id?: string | null
          watch_duration?: number | null
          watch_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "viewer_sessions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string | null
          events: string[]
          id: string
          secret: string
          status: string | null
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          id?: string
          secret: string
          status?: string | null
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          id?: string
          secret?: string
          status?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          endpoint_id: string | null
          error_message: string | null
          event_type: string
          id: string
          metadata: Json | null
          payload: Json | null
          provider: string | null
          response_body: string | null
          response_status: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          endpoint_id?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          payload?: Json | null
          provider?: string | null
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          endpoint_id?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          payload?: Json | null
          provider?: string | null
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      webhook_stats_24h: {
        Row: {
          count: number | null
          count_last_6h: number | null
          count_last_hour: number | null
          event_type: string | null
          provider: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: { p_credits: number; p_user_id: string }
        Returns: undefined
      }
      aggregate_daily_metrics: { Args: { p_date?: string }; Returns: number }
      award_social_share_credits: {
        Args: { p_platform: string; p_user_id: string; p_video_id: string }
        Returns: boolean
      }
      cleanup_old_sessions: { Args: never; Returns: number }
      create_organization: {
        Args: { p_name: string; p_slug: string; p_user_id?: string }
        Returns: string
      }
      deduct_credits: {
        Args: { p_credits?: number; p_user_id: string }
        Returns: boolean
      }
      delete_user_account: { Args: never; Returns: undefined }
      get_remaining_social_share_credits: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_organizations: {
        Args: { p_user_id?: string }
        Returns: {
          is_current: boolean
          organization_id: string
          organization_logo: string
          organization_name: string
          organization_slug: string
          role: string
        }[]
      }
      get_video_share_status: {
        Args: { p_user_id: string; p_video_id: string }
        Returns: {
          credits_awarded: number
          platform: string
          shared: boolean
        }[]
      }
      switch_organization: {
        Args: { p_organization_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

