export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cards_catalog: {
        Row: {
          base_atk: number
          base_def: number
          created_at: string
          description: string | null
          element: Database["public"]["Enums"]["card_element"]
          id: number
          image_url: string
          name: string
          rarity: Database["public"]["Enums"]["card_rarity"]
        }
        Insert: {
          base_atk: number
          base_def: number
          created_at?: string
          description?: string | null
          element: Database["public"]["Enums"]["card_element"]
          id?: number
          image_url: string
          name: string
          rarity?: Database["public"]["Enums"]["card_rarity"]
        }
        Update: {
          base_atk?: number
          base_def?: number
          created_at?: string
          description?: string | null
          element?: Database["public"]["Enums"]["card_element"]
          id?: number
          image_url?: string
          name?: string
          rarity?: Database["public"]["Enums"]["card_rarity"]
        }
        Relationships: []
      }
      forge_history: {
        Row: {
          confirmed_at: string | null
          created_at: string
          expires_at: string
          generated_stats: Json
          id: string
          new_token_id: number
          nonce: string
          oracle_signature: string
          parent_a_token_id: number
          parent_b_token_id: number
          player_address: string
          result_card_id: string | null
          stats_hash: string
          status: Database["public"]["Enums"]["forge_status"]
          tx_hash: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          expires_at: string
          generated_stats: Json
          id?: string
          new_token_id: number
          nonce: string
          oracle_signature: string
          parent_a_token_id: number
          parent_b_token_id: number
          player_address: string
          result_card_id?: string | null
          stats_hash: string
          status?: Database["public"]["Enums"]["forge_status"]
          tx_hash?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          generated_stats?: Json
          id?: string
          new_token_id?: number
          nonce?: string
          oracle_signature?: string
          parent_a_token_id?: number
          parent_b_token_id?: number
          player_address?: string
          result_card_id?: string | null
          stats_hash?: string
          status?: Database["public"]["Enums"]["forge_status"]
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forge_history_parent_a_token_id_fkey"
            columns: ["parent_a_token_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["token_id"]
          },
          {
            foreignKeyName: "forge_history_parent_b_token_id_fkey"
            columns: ["parent_b_token_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["token_id"]
          },
          {
            foreignKeyName: "forge_history_result_card_id_fkey"
            columns: ["result_card_id"]
            isOneToOne: true
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          atk: number
          burned_at: string | null
          catalog_id: number | null
          created_at: string
          def: number
          element: Database["public"]["Enums"]["card_element"]
          id: string
          image_url: string
          is_burned: boolean
          is_forged: boolean
          lore: string | null
          metadata_uri: string | null
          mint_tx_hash: string
          name: string
          passive_skill: string | null
          player_address: string
          rarity: Database["public"]["Enums"]["card_rarity"]
          stats_hash: string | null
          token_id: number
        }
        Insert: {
          atk: number
          burned_at?: string | null
          catalog_id?: number | null
          created_at?: string
          def: number
          element: Database["public"]["Enums"]["card_element"]
          id?: string
          image_url: string
          is_burned?: boolean
          is_forged?: boolean
          lore?: string | null
          metadata_uri?: string | null
          mint_tx_hash: string
          name: string
          passive_skill?: string | null
          player_address: string
          rarity?: Database["public"]["Enums"]["card_rarity"]
          stats_hash?: string | null
          token_id: number
        }
        Update: {
          atk?: number
          burned_at?: string | null
          catalog_id?: number | null
          created_at?: string
          def?: number
          element?: Database["public"]["Enums"]["card_element"]
          id?: string
          image_url?: string
          is_burned?: boolean
          is_forged?: boolean
          lore?: string | null
          metadata_uri?: string | null
          mint_tx_hash?: string
          name?: string
          passive_skill?: string | null
          player_address?: string
          rarity?: Database["public"]["Enums"]["card_rarity"]
          stats_hash?: string | null
          token_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "cards_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      card_element:
        | "FIRE"
        | "WATER"
        | "EARTH"
        | "AIR"
        | "STEAM"
        | "MAGMA"
        | "LIGHTNING"
        | "NATURE"
        | "ICE"
        | "SAND"
        | "AETHER"
      card_rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"
      forge_status: "PENDING" | "CONFIRMED" | "FAILED" | "EXPIRED"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      card_element: [
        "FIRE",
        "WATER",
        "EARTH",
        "AIR",
        "STEAM",
        "MAGMA",
        "LIGHTNING",
        "NATURE",
        "ICE",
        "SAND",
        "AETHER",
      ],
      card_rarity: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
      forge_status: ["PENDING", "CONFIRMED", "FAILED", "EXPIRED"],
    },
  },
} as const

