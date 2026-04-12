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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          content: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bio_link: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bio_link?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bio_link?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          post_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          post_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          custom_font: string | null
          excerpt: string | null
          featured_image: string | null
          featured_image_alt: string | null
          id: string
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time: number | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          custom_font?: string | null
          excerpt?: string | null
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          custom_font?: string | null
          excerpt?: string | null
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      cta_content: {
        Row: {
          button_link: string | null
          button_text: string | null
          description: string | null
          highlight_word: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          description?: string | null
          highlight_word?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          description?: string | null
          highlight_word?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      experience_page_content: {
        Row: {
          cta_button_link: string | null
          cta_button_text: string | null
          cta_description: string | null
          cta_highlight_word: string | null
          cta_title: string | null
          cta_visible: boolean | null
          highlight_word: string | null
          id: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cta_button_link?: string | null
          cta_button_text?: string | null
          cta_description?: string | null
          cta_highlight_word?: string | null
          cta_title?: string | null
          cta_visible?: boolean | null
          highlight_word?: string | null
          id?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          cta_button_link?: string | null
          cta_button_text?: string | null
          cta_description?: string | null
          cta_highlight_word?: string | null
          cta_title?: string | null
          cta_visible?: boolean | null
          highlight_word?: string | null
          id?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          accent: string | null
          company: string | null
          description: string | null
          end_date: string | null
          highlights: string[] | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_current: boolean | null
          location: string | null
          sort_order: number | null
          start_date: string | null
          title: string
          title_link: string | null
          updated_at: string
        }
        Insert: {
          accent?: string | null
          company?: string | null
          description?: string | null
          end_date?: string | null
          highlights?: string[] | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          location?: string | null
          sort_order?: number | null
          start_date?: string | null
          title: string
          title_link?: string | null
          updated_at?: string
        }
        Update: {
          accent?: string | null
          company?: string | null
          description?: string | null
          end_date?: string | null
          highlights?: string[] | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          location?: string | null
          sort_order?: number | null
          start_date?: string | null
          title?: string
          title_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      footer_content: {
        Row: {
          bottom_tagline: string | null
          brand_description: string | null
          copyright_text: string | null
          id: string
          updated_at: string
        }
        Insert: {
          bottom_tagline?: string | null
          brand_description?: string | null
          copyright_text?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          bottom_tagline?: string | null
          brand_description?: string | null
          copyright_text?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          href: string
          id: string
          is_active: boolean | null
          label: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          href: string
          id?: string
          is_active?: boolean | null
          label: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          href?: string
          id?: string
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      google_sheets_config: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          service_account_credentials: string | null
          sheet_name: string | null
          spreadsheet_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          service_account_credentials?: string | null
          sheet_name?: string | null
          spreadsheet_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          service_account_credentials?: string | null
          sheet_name?: string | null
          spreadsheet_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          badge_subtitle: string | null
          badge_title: string | null
          cta_link: string | null
          cta_text: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge_subtitle?: string | null
          badge_title?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge_subtitle?: string | null
          badge_title?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      nav_links: {
        Row: {
          href: string
          id: string
          is_active: boolean | null
          label: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          href: string
          id?: string
          is_active?: boolean | null
          label: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          href?: string
          id?: string
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      navigation_settings: {
        Row: {
          favicon_url: string | null
          id: string
          logo_url: string | null
          site_name: string
          site_name_accent: string | null
          updated_at: string
        }
        Insert: {
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          site_name?: string
          site_name_accent?: string | null
          updated_at?: string
        }
        Update: {
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          site_name?: string
          site_name_accent?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          default_og_image: string | null
          id: string
          site_description: string | null
          site_title: string | null
          updated_at: string
        }
        Insert: {
          default_og_image?: string | null
          id?: string
          site_description?: string | null
          site_title?: string | null
          updated_at?: string
        }
        Update: {
          default_og_image?: string | null
          id?: string
          site_description?: string | null
          site_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          description: string | null
          icon: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          icon: string
          id: string
          is_active: boolean | null
          platform: string
          sort_order: number | null
          updated_at: string
          url: string
        }
        Insert: {
          icon?: string
          id?: string
          is_active?: boolean | null
          platform: string
          sort_order?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          icon?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          sort_order?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          company: string | null
          content: string
          id: string
          is_active: boolean | null
          name: string
          rating: number | null
          role: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          content: string
          id?: string
          is_active?: boolean | null
          name: string
          rating?: number | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          rating?: number | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      third_party_integrations: {
        Row: {
          id: string
          is_active: boolean | null
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
