import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://moewsyzijscixjeckmqr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXdzeXppanNjaXhqZWNrbXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5Mjc2OTYsImV4cCI6MjA5NDUwMzY5Nn0.2GodCp8cfTwd-2UUHE8fCPfgSQUdxLp4AwNTgzUkYG8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
