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
      academic_years: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          semester: number
          year: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          semester: number
          year: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          semester?: number
          year?: string
        }
        Relationships: []
      }
      classrooms: {
        Row: {
          capacity: number
          created_at: string
          id: string
          is_lab: boolean | null
          name: string
        }
        Insert: {
          capacity: number
          created_at?: string
          id?: string
          is_lab?: boolean | null
          name: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          is_lab?: boolean | null
          name?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      faculty: {
        Row: {
          created_at: string
          department_id: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          department_id: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          department_id?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_availability: {
        Row: {
          created_at: string
          faculty_id: string
          id: string
          is_available: boolean | null
          time_slot_id: string
          working_day_id: string
        }
        Insert: {
          created_at?: string
          faculty_id: string
          id?: string
          is_available?: boolean | null
          time_slot_id: string
          working_day_id: string
        }
        Update: {
          created_at?: string
          faculty_id?: string
          id?: string
          is_available?: boolean | null
          time_slot_id?: string
          working_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_availability_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_availability_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_availability_working_day_id_fkey"
            columns: ["working_day_id"]
            isOneToOne: false
            referencedRelation: "working_days"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_subjects: {
        Row: {
          created_at: string
          faculty_id: string
          id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          faculty_id: string
          id?: string
          subject_id: string
        }
        Update: {
          created_at?: string
          faculty_id?: string
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_subjects_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department_id: string | null
          faculty_id: string | null
          full_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          faculty_id?: string | null
          full_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          faculty_id?: string | null
          full_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          academic_year_id: string
          created_at: string
          department_id: string
          id: string
          name: string
          year_of_study: number
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          department_id: string
          id?: string
          name: string
          year_of_study: number
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          department_id?: string
          id?: string
          name?: string
          year_of_study?: number
        }
        Relationships: [
          {
            foreignKeyName: "sections_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          section_id: string
          subject_type: Database["public"]["Enums"]["subject_type"]
          weekly_hours: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          section_id: string
          subject_type?: Database["public"]["Enums"]["subject_type"]
          weekly_hours: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          section_id?: string
          subject_type?: Database["public"]["Enums"]["subject_type"]
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          break_name: string | null
          created_at: string
          end_time: string
          id: string
          is_break: boolean | null
          slot_order: number
          start_time: string
        }
        Insert: {
          break_name?: string | null
          created_at?: string
          end_time: string
          id?: string
          is_break?: boolean | null
          slot_order: number
          start_time: string
        }
        Update: {
          break_name?: string | null
          created_at?: string
          end_time?: string
          id?: string
          is_break?: boolean | null
          slot_order?: number
          start_time?: string
        }
        Relationships: []
      }
      timetable_entries: {
        Row: {
          classroom_id: string
          created_at: string
          faculty_id: string
          id: string
          is_locked: boolean | null
          section_id: string
          subject_id: string
          time_slot_id: string
          timetable_id: string
          working_day_id: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          faculty_id: string
          id?: string
          is_locked?: boolean | null
          section_id: string
          subject_id: string
          time_slot_id: string
          timetable_id: string
          working_day_id: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          faculty_id?: string
          id?: string
          is_locked?: boolean | null
          section_id?: string
          subject_id?: string
          time_slot_id?: string
          timetable_id?: string
          working_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_working_day_id_fkey"
            columns: ["working_day_id"]
            isOneToOne: false
            referencedRelation: "working_days"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          academic_year_id: string
          created_at: string
          error_message: string | null
          generated_at: string
          generation_status: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          error_message?: string | null
          generated_at?: string
          generation_status?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          error_message?: string | null
          generated_at?: string
          generation_status?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetables_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
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
      working_days: {
        Row: {
          created_at: string
          day_name: string
          day_order: number
          id: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string
          day_name: string
          day_order: number
          id?: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string
          day_name?: string
          day_order?: number
          id?: string
          is_active?: boolean | null
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
    }
    Enums: {
      app_role: "admin" | "faculty" | "student"
      subject_type: "theory" | "lab"
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
      app_role: ["admin", "faculty", "student"],
      subject_type: ["theory", "lab"],
    },
  },
} as const
