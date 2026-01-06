
import { createClient } from '@supabase/supabase-js';

// Verificação segura para evitar erro "process is not defined" no browser
const getEnv = (name: string, fallback: string) => {
  try {
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env && process.env[name]) || fallback;
  } catch {
    return fallback;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL', 'https://bihetneovkpvryacnuyj.supabase.co');
const supabaseKey = getEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaGV0bmVvdmtwdnJ5YWNudXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzExNzEsImV4cCI6MjA4MzI0NzE3MX0.exxLJ9d2hfT10f2IwGejfWGZyJzmMzLY2FdmwohUpyw');

export const supabase = createClient(supabaseUrl, supabaseKey);
