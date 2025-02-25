
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hirnutmqmsrvsxkikbwj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpcm51dG1xbXNydnN4a2lrYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDU0NzUsImV4cCI6MjA1NjA4MTQ3NX0.a4t-xtdGZt5xBZ-REXWD8KpDfqzUqMyqURg_BVS2pn0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
