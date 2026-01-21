import { createClient } from '@supabase/supabase-js';

// Credenciais reais do projeto NightFlow no Supabase
const supabaseUrl = 'https://wrnmnlhiuhrwjoakxtek.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indybm1ubGhpdWhyd2pvYWt4dGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODk4MDQsImV4cCI6MjA4NDU2NTgwNH0.egomRGaNKcIXGvBJMKzAIniTlmZWPwWhFUmYGCulW_k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);