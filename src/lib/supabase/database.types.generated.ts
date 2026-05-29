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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          icon: string | null
          id: number
          kind: Database["public"]["Enums"]["category_kind"]
          name_kk: string
          name_ru: string
          parent_id: number | null
          slug: string
          sort_order: number
        }
        Insert: {
          icon?: string | null
          id?: number
          kind: Database["public"]["Enums"]["category_kind"]
          name_kk: string
          name_ru: string
          parent_id?: number | null
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string | null
          id?: number
          kind?: Database["public"]["Enums"]["category_kind"]
          name_kk?: string
          name_ru?: string
          parent_id?: number | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          id: number
          name_kk: string
          name_ru: string
          region_id: number
          slug: string
        }
        Insert: {
          id?: number
          name_kk: string
          name_ru: string
          region_id: number
          slug: string
        }
        Update: {
          id?: number
          name_kk?: string
          name_ru?: string
          region_id?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          city_id: number
          id: number
          name_kk: string
          name_ru: string
          slug: string
        }
        Insert: {
          city_id: number
          id?: number
          name_kk: string
          name_ru: string
          slug: string
        }
        Update: {
          city_id?: number
          id?: number
          name_kk?: string
          name_ru?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          city_id: number | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          organizer: string | null
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
        }
        Insert: {
          address?: string | null
          city_id?: number | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          organizer?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
        }
        Update: {
          address?: string | null
          city_id?: number | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          organizer?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_attributes: {
        Row: {
          attribute_key: string
          listing_id: string
          value_bool: boolean | null
          value_num: number | null
          value_text: string | null
        }
        Insert: {
          attribute_key: string
          listing_id: string
          value_bool?: boolean | null
          value_num?: number | null
          value_text?: string | null
        }
        Update: {
          attribute_key?: string
          listing_id?: string
          value_bool?: boolean | null
          value_num?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_attributes_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          order_index: number
          path: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          order_index?: number
          path: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          order_index?: number
          path?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category_id: number
          city_id: number | null
          created_at: string
          currency: string
          deal_type: Database["public"]["Enums"]["listing_deal_type"]
          description: string | null
          district_id: number | null
          expires_at: string | null
          id: string
          is_bulk: boolean
          is_featured: boolean
          owner_id: string
          price: number | null
          promoted_until: string | null
          quantity: number | null
          region_id: number | null
          rejection_reason: string | null
          search_tsv: unknown
          status: Database["public"]["Enums"]["listing_status"]
          title: string | null
          unit: Database["public"]["Enums"]["listing_unit"] | null
          updated_at: string
          views_count: number
        }
        Insert: {
          category_id: number
          city_id?: number | null
          created_at?: string
          currency?: string
          deal_type?: Database["public"]["Enums"]["listing_deal_type"]
          description?: string | null
          district_id?: number | null
          expires_at?: string | null
          id?: string
          is_bulk?: boolean
          is_featured?: boolean
          owner_id: string
          price?: number | null
          promoted_until?: string | null
          quantity?: number | null
          region_id?: number | null
          rejection_reason?: string | null
          search_tsv?: unknown
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string | null
          unit?: Database["public"]["Enums"]["listing_unit"] | null
          updated_at?: string
          views_count?: number
        }
        Update: {
          category_id?: number
          city_id?: number | null
          created_at?: string
          currency?: string
          deal_type?: Database["public"]["Enums"]["listing_deal_type"]
          description?: string | null
          district_id?: number | null
          expires_at?: string | null
          id?: string
          is_bulk?: boolean
          is_featured?: boolean
          owner_id?: string
          price?: number | null
          promoted_until?: string | null
          quantity?: number | null
          region_id?: number | null
          rejection_reason?: string | null
          search_tsv?: unknown
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string | null
          unit?: Database["public"]["Enums"]["listing_unit"] | null
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          id: number
          name_kk: string
          name_ru: string
          slug: string
        }
        Insert: {
          id?: number
          name_kk: string
          name_ru: string
          slug: string
        }
        Update: {
          id?: number
          name_kk?: string
          name_ru?: string
          slug?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target_type"]
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target_type"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_listing_views: {
        Args: { p_listing_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_moderator: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      category_kind: "pets" | "livestock" | "goods" | "services" | "events"
      event_status: "draft" | "published" | "archived"
      listing_deal_type: "sale" | "gift" | "exchange"
      listing_status:
        | "draft"
        | "pending"
        | "published"
        | "archived"
        | "rejected"
      listing_unit: "piece" | "head" | "kg"
      report_status: "open" | "in_review" | "resolved" | "rejected"
      report_target_type: "listing" | "user" | "event"
      user_role: "admin" | "moderator"
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
      category_kind: ["pets", "livestock", "goods", "services", "events"],
      event_status: ["draft", "published", "archived"],
      listing_deal_type: ["sale", "gift", "exchange"],
      listing_status: ["draft", "pending", "published", "archived", "rejected"],
      listing_unit: ["piece", "head", "kg"],
      report_status: ["open", "in_review", "resolved", "rejected"],
      report_target_type: ["listing", "user", "event"],
      user_role: ["admin", "moderator"],
    },
  },
} as const
