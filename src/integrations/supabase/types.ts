export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string | null
          created_at: string | null
          feedback_type: string
          id: string
          message: string | null
          page_url: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          feedback_type: string
          id?: string
          message?: string | null
          page_url?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          feedback_type?: string
          id?: string
          message?: string | null
          page_url?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      founding_members: {
        Row: {
          created_at: string | null
          display_on_wall: boolean | null
          id: string
          member_number: number
          price_paid: number
          purchased_at: string | null
          special_badge: string | null
          tier: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_on_wall?: boolean | null
          id?: string
          member_number: number
          price_paid: number
          purchased_at?: string | null
          special_badge?: string | null
          tier: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_on_wall?: boolean | null
          id?: string
          member_number?: number
          price_paid?: number
          purchased_at?: string | null
          special_badge?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          created_at: string | null
          featured: boolean | null
          id: string
          image_url: string
          message: string | null
          message_type: string | null
          occasion_date: string | null
          occasion_type: string | null
          prompt: string
          recipient_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          featured?: boolean | null
          id?: string
          image_url: string
          message?: string | null
          message_type?: string | null
          occasion_date?: string | null
          occasion_type?: string | null
          prompt: string
          recipient_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string
          message?: string | null
          message_type?: string | null
          occasion_date?: string | null
          occasion_type?: string | null
          prompt?: string
          recipient_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_tracking: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          month: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          month?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          month?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "generation_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      party_packs: {
        Row: {
          banner_url: string
          cake_image_id: string
          cake_topper_url: string
          created_at: string
          id: string
          invitation_url: string
          place_cards_url: string
          thank_you_card_url: string
          user_id: string
        }
        Insert: {
          banner_url: string
          cake_image_id: string
          cake_topper_url: string
          created_at?: string
          id?: string
          invitation_url: string
          place_cards_url: string
          thank_you_card_url: string
          user_id: string
        }
        Update: {
          banner_url?: string
          cake_image_id?: string
          cake_topper_url?: string
          created_at?: string
          id?: string
          invitation_url?: string
          place_cards_url?: string
          thank_you_card_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_packs_cake_image_id_fkey"
            columns: ["cake_image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          current_streak: number | null
          email: string
          first_name: string | null
          founding_member_number: number | null
          founding_tier: string | null
          id: string
          is_founding_member: boolean | null
          is_premium: boolean | null
          last_generation_date: string | null
          last_name: string | null
          lifetime_access: boolean | null
          premium_until: string | null
          purchased_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          email: string
          first_name?: string | null
          founding_member_number?: number | null
          founding_tier?: string | null
          id: string
          is_founding_member?: boolean | null
          is_premium?: boolean | null
          last_generation_date?: string | null
          last_name?: string | null
          lifetime_access?: boolean | null
          premium_until?: string | null
          purchased_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          email?: string
          first_name?: string | null
          founding_member_number?: number | null
          founding_tier?: string | null
          id?: string
          is_founding_member?: boolean | null
          is_premium?: boolean | null
          last_generation_date?: string | null
          last_name?: string | null
          lifetime_access?: boolean | null
          premium_until?: string | null
          purchased_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          reward_days: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          reward_days?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_days?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          created_at: string | null
          id: string
          image_id: string
          reminder_date: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_id: string
          reminder_date: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_id?: string
          reminder_date?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "generated_images"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          anniversary_reminders: boolean | null
          birthday_reminders: boolean | null
          created_at: string
          email_reminders: boolean | null
          id: string
          marketing_emails: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anniversary_reminders?: boolean | null
          birthday_reminders?: boolean | null
          created_at?: string
          email_reminders?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anniversary_reminders?: boolean | null
          birthday_reminders?: boolean | null
          created_at?: string
          email_reminders?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_activity_feed: {
        Args: { p_activity_type: string; p_message: string }
        Returns: undefined
      }
      get_available_spots: { Args: never; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
