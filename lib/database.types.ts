export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          item_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          item_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          item_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      items: {
        Row: {
          category: string;
          condition: string | null;
          created_at: string;
          description: string | null;
          donor_id: string;
          id: string;
          photo_path: string | null;
          quantity: number;
          rt_id: string;
          status: string | null;
          title: string;
          unit: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          condition?: string | null;
          created_at?: string;
          description?: string | null;
          donor_id: string;
          id?: string;
          photo_path?: string | null;
          quantity?: number;
          rt_id: string;
          status?: string | null;
          title: string;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          condition?: string | null;
          created_at?: string;
          description?: string | null;
          donor_id?: string;
          id?: string;
          photo_path?: string | null;
          quantity?: number;
          rt_id?: string;
          status?: string | null;
          title?: string;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_donor_id_fkey";
            columns: ["donor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "items_rt_id_fkey";
            columns: ["rt_id"];
            isOneToOne: false;
            referencedRelation: "rts";
            referencedColumns: ["id"];
          }
        ];
      };
      members: {
        Row: {
          id: string;
          joined_at: string;
          profile_id: string;
          role: string;
          rt_id: string;
        };
        Insert: {
          id?: string;
          joined_at?: string;
          profile_id: string;
          role?: string;
          rt_id: string;
        };
        Update: {
          id?: string;
          joined_at?: string;
          profile_id?: string;
          role?: string;
          rt_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "members_rt_id_fkey";
            columns: ["rt_id"];
            isOneToOne: false;
            referencedRelation: "rts";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      requests: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          message: string | null;
          pickup_address: string | null;
          pickup_code: string | null;
          pickup_code_used_at: string | null;
          requester_id: string;
          scheduled_pickup_date: string | null;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          message?: string | null;
          pickup_address?: string | null;
          pickup_code?: string | null;
          pickup_code_used_at?: string | null;
          requester_id: string;
          scheduled_pickup_date?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          message?: string | null;
          pickup_address?: string | null;
          pickup_code?: string | null;
          pickup_code_used_at?: string | null;
          requester_id?: string;
          scheduled_pickup_date?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requests_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requests_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      rts: {
        Row: {
          created_at: string;
          id: string;
          kecamatan: string;
          kelurahan: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kecamatan: string;
          kelurahan: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          kecamatan?: string;
          kelurahan?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
