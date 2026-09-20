const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSignatures() {
  console.log("Checking signatures table...");
  const { data, error } = await supabase.from('signatures').select('*');
  if (error) {
    console.error("Error querying signatures:", error);
  } else {
    console.log("Signatures found:", data.length);
    console.log(data);
  }
}
checkSignatures();
