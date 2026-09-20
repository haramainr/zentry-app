const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Simulate client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testReg() {
  const email = `test${Date.now()}@test.com`;
  console.log("Registering", email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: { full_name: 'Test', role: 'Sales' }
    }
  });

  if (error) {
    console.error("SignUp error:", error);
    return;
  }
  
  console.log("User ID:", data.user.id);
  console.log("Has session?", !!data.session);

  if (data.session) {
    // We have a session, so RLS should work!
    const { error: dbError } = await supabase.from('signatures').insert({
      user_id: data.user.id,
      signature_url: 'data:image/png;base64,TEST'
    });
    
    if (dbError) {
      console.error("Insert error:", dbError);
    } else {
      console.log("Signature inserted successfully!");
    }
  } else {
    console.error("NO SESSION RETURNED! Email confirmations might be ON!");
  }
}
testReg();
