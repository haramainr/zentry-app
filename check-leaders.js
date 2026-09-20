const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking leaders anonymously...");
  const { data, error } = await supabase.from('users').select('id, full_name').eq('role', 'Leader');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Leaders found:", data);
  }
}
check();
