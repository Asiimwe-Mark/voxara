export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      webhook_logs: {
        Row: {
          id: string
          provider: 'paddle' | 'flutterwave'
          event_type: string
          user_id: string | null
          payload: Json
          status: 'success' | 'failure'
          error_message: string | null
          metadata: Json | null
          endpoint_id: string | null
          response_status: number | null
          response_body: string | null
          duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          provider: 'paddle' | 'flutterwave'
          event_type: string
          user_id?: string | null
          payload: Json
          status: 'success' | 'failure'
          error_message?: string | null
          metadata?: Json | null
          endpoint_id?: string | null
          response_status?: number | null
          response_body?: string | null
          duration_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          provider?: 'paddle' | 'flutterwave'
          event_type?: string
          user_id?: string | null
          payload?: Json
          status?: 'success' | 'failure'
          error_message?: string | null
          metadata?: Json | null
          endpoint_id?: string | null
          response_status?: number | null
          response_body?: string | null
          duration_ms?: number | null
          created_at?: string
        }
      }
      webhook_endpoints: {
        Row: {
          id: string
          user_id: string
          url: string
          secret: string
          events: string[]
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          secret: string
          events: string[]
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          secret?: string
          events?: string[]
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          user_id: string
          title: string
          script: string | null
          status: 'draft' | 'processing' | 'ready' | 'failed'
          avatar_url: string | null
          voice_id: string | null
          video_url: string | null
          thumbnail_url: string | null
          duration: number | null
          credits_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          script?: string | null
          status?: 'draft' | 'processing' | 'ready' | 'failed'
          avatar_url?: string | null
          voice_id?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          duration?: number | null
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          script?: string | null
          status?: 'draft' | 'processing' | 'ready' | 'failed'
          avatar_url?: string | null
          voice_id?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          duration?: number | null
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: 'youtube' | 'tiktok' | 'instagram' | 'linkedin'
          account_id: string
          username: string | null
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'youtube' | 'tiktok' | 'instagram' | 'linkedin'
          account_id: string
          username?: string | null
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'youtube' | 'tiktok' | 'instagram' | 'linkedin'
          account_id?: string
          username?: string | null
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
