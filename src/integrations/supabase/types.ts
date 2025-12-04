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
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          ai_generated: boolean | null
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          engagement_score: number | null
          excerpt: string | null
          featured_image: string | null
          featured_image_alt: string | null
          id: string
          is_curated: boolean | null
          main_keyword: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          source_name: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["article_status"] | null
          title: string
          topic_cluster_id: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          engagement_score?: number | null
          excerpt?: string | null
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          is_curated?: boolean | null
          main_keyword?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          source_name?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          title: string
          topic_cluster_id?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          engagement_score?: number | null
          excerpt?: string | null
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          is_curated?: boolean | null
          main_keyword?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          source_name?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["article_status"] | null
          title?: string
          topic_cluster_id?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_topic_cluster_id_fkey"
            columns: ["topic_cluster_id"]
            isOneToOne: false
            referencedRelation: "topic_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      authority_sources: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          name: string
          trust_score: number | null
          url: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          name: string
          trust_score?: number | null
          url: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          name?: string
          trust_score?: number | null
          url?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string | null
          id: string
          is_ai: boolean | null
          name: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          name: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          name?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          inquiry_type: string
          message: string
          name: string
          phone: string | null
          read_at: string | null
          responded_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inquiry_type: string
          message: string
          name: string
          phone?: string | null
          read_at?: string | null
          responded_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          name?: string
          phone?: string | null
          read_at?: string | null
          responded_at?: string | null
        }
        Relationships: []
      }
      curated_news: {
        Row: {
          article_id: string | null
          engagement_potential: number | null
          fetched_at: string | null
          id: string
          original_content: string | null
          original_title: string
          original_url: string
          processed: boolean | null
          source_id: string | null
        }
        Insert: {
          article_id?: string | null
          engagement_potential?: number | null
          fetched_at?: string | null
          id?: string
          original_content?: string | null
          original_title: string
          original_url: string
          processed?: boolean | null
          source_id?: string | null
        }
        Update: {
          article_id?: string | null
          engagement_potential?: number | null
          fetched_at?: string | null
          id?: string
          original_content?: string | null
          original_title?: string
          original_url?: string
          processed?: boolean | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curated_news_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_news_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      external_links: {
        Row: {
          anchor_text: string
          article_id: string | null
          created_at: string | null
          domain: string
          id: string
          url: string
        }
        Insert: {
          anchor_text: string
          article_id?: string | null
          created_at?: string | null
          domain: string
          id?: string
          url: string
        }
        Update: {
          anchor_text?: string
          article_id?: string | null
          created_at?: string | null
          domain?: string
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_links_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      fallback_images: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string | null
          id: string
          url: string
          usage_count: number | null
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          url: string
          usage_count?: number | null
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          url?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      internal_links: {
        Row: {
          anchor_text: string
          created_at: string | null
          id: string
          source_article_id: string | null
          target_article_id: string | null
        }
        Insert: {
          anchor_text: string
          created_at?: string | null
          id?: string
          source_article_id?: string | null
          target_article_id?: string | null
        }
        Update: {
          anchor_text?: string
          created_at?: string | null
          id?: string
          source_article_id?: string | null
          target_article_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_links_source_article_id_fkey"
            columns: ["source_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_links_target_article_id_fkey"
            columns: ["target_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_sources: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_fetched_at: string | null
          name: string
          rss_feed: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          name: string
          rss_feed?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          name?: string
          rss_feed?: string | null
          url?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      pillar_pages: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_articles: string[] | null
          featured_image: string | null
          featured_image_alt: string | null
          id: string
          main_keyword: string | null
          meta_description: string | null
          meta_title: string | null
          reading_time: number | null
          slug: string
          status: string | null
          table_of_contents: Json | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_articles?: string[] | null
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          main_keyword?: string | null
          meta_description?: string | null
          meta_title?: string | null
          reading_time?: number | null
          slug: string
          status?: string | null
          table_of_contents?: Json | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_articles?: string[] | null
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          main_keyword?: string | null
          meta_description?: string | null
          meta_title?: string | null
          reading_time?: number | null
          slug?: string
          status?: string | null
          table_of_contents?: Json | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pillar_pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillar_pages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_metrics: {
        Row: {
          analyzed_at: string | null
          article_id: string | null
          external_links_count: number | null
          h1_count: number | null
          h2_count: number | null
          h3_count: number | null
          id: string
          internal_links_count: number | null
          keyword_density: number | null
          seo_score: number | null
          word_count: number | null
        }
        Insert: {
          analyzed_at?: string | null
          article_id?: string | null
          external_links_count?: number | null
          h1_count?: number | null
          h2_count?: number | null
          h3_count?: number | null
          id?: string
          internal_links_count?: number | null
          keyword_density?: number | null
          seo_score?: number | null
          word_count?: number | null
        }
        Update: {
          analyzed_at?: string | null
          article_id?: string | null
          external_links_count?: number | null
          h1_count?: number | null
          h2_count?: number | null
          h3_count?: number | null
          id?: string
          internal_links_count?: number | null
          keyword_density?: number | null
          seo_score?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_metrics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      topic_clusters: {
        Row: {
          article_count: number | null
          category_id: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          article_count?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          article_count?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_clusters_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reading_history: {
        Row: {
          article_id: string | null
          id: string
          read_at: string | null
          scroll_depth: number | null
          session_id: string
          time_spent: number | null
        }
        Insert: {
          article_id?: string | null
          id?: string
          read_at?: string | null
          scroll_depth?: number | null
          session_id: string
          time_spent?: number | null
        }
        Update: {
          article_id?: string | null
          id?: string
          read_at?: string | null
          scroll_depth?: number | null
          session_id?: string
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reading_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
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
      web_vitals_metrics: {
        Row: {
          connection_type: string | null
          created_at: string | null
          id: string
          metric_name: string
          metric_rating: string | null
          metric_value: number
          page_url: string | null
          user_agent: string | null
        }
        Insert: {
          connection_type?: string | null
          created_at?: string | null
          id?: string
          metric_name: string
          metric_rating?: string | null
          metric_value: number
          page_url?: string | null
          user_agent?: string | null
        }
        Update: {
          connection_type?: string | null
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_rating?: string | null
          metric_value?: number
          page_url?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_views: {
        Args: { article_slug: string }
        Returns: undefined
      }
      increment_pillar_views: {
        Args: { page_slug: string }
        Returns: undefined
      }
      recalculate_all_seo_metrics: {
        Args: never
        Returns: {
          articles_processed: number
          avg_score: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
      article_status: "draft" | "scheduled" | "published" | "archived"
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
      app_role: ["admin", "editor", "viewer"],
      article_status: ["draft", "scheduled", "published", "archived"],
    },
  },
} as const
