import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types - we'll expand these as we build
export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          email: string | null
          wallet_address: string | null
          business_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          wallet_address?: string | null
          business_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          wallet_address?: string | null
          business_name?: string | null
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          merchant_id: string
          title: string
          description: string
          discount_percentage: number
          code: string
          is_active: boolean
          expires_at: string | null
          redemptions: number
          max_redemptions: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          title: string
          description: string
          discount_percentage: number
          code: string
          is_active?: boolean
          expires_at?: string | null
          redemptions?: number
          max_redemptions?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          title?: string
          description?: string
          discount_percentage?: number
          code?: string
          is_active?: boolean
          expires_at?: string | null
          redemptions?: number
          max_redemptions?: number | null
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          merchant_id: string
          customer_wallet: string | null
          amount: number
          currency: string
          status: string
          transaction_hash: string | null
          offer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          customer_wallet?: string | null
          amount: number
          currency: string
          status: string
          transaction_hash?: string | null
          offer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          customer_wallet?: string | null
          amount?: number
          currency?: string
          status?: string
          transaction_hash?: string | null
          offer_id?: string | null
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
  }
}
