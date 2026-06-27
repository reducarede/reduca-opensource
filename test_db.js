import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qozmurfkmnbtryvzmayt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvem11cmZrbW5idHJ5dnptYXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzMwMDAsImV4cCI6MjA5NzA0OTAwMH0.ZSvD06M61Dy70CPm_7DgW5pmcLov0h6Bw_AR8CJJleQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('follows').select('*').limit(1);
  console.log("follows table:", error ? error.message : "Exists!");
  
  const { data: d2, error: e2 } = await supabase.from('amizades').select('*').limit(1);
  console.log("amizades table:", e2 ? e2.message : "Exists!");
}

test();
