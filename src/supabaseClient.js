import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chstjfzntguplscvadkk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoc3RqZnpudGd1cGxzY3ZhZGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODY0MjMsImV4cCI6MjA3MjU2MjQyM30.IH7MPMYLwIZYAm3gNCkrQJF-itc3i-r1vyLDroBxebM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
