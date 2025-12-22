const getSupabaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_SUPABASE_URL_DEV;
  }
  return process.env.REACT_APP_SUPABASE_URL_PROD;
};

const getSupabaseAnonKey = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_SUPABASE_ANON_KEY_DEV;
  }
  return process.env.REACT_APP_SUPABASE_ANON_KEY_PROD;
};

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();