const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSigs() {
  console.log("Checking signatures...");
  const { data, error } = await supabase.from('signatures').select('*');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Signatures found:", data.length);
    if(data.length > 0) {
      console.log("First signature snippet:", data[0].signature_url.substring(0, 30));
    }
  }
}
checkSigs();
