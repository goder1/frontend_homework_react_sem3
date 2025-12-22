import { createClient } from '@supabase/supabase-js';

// Для Vite используем import.meta.env вместо process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000' || 'http://localhost:5432';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYwMzk2ODgzNCwiZXhwIjoyNTUwNjUzNjM0LCJhdWQiOiIiLCJzdWIiOiIiLCJyb2xlIjoiYW5vbiJ9.7G7VZ0b2Q1Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  }
});