const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nsrwbxsuqucvvstdrbkv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcndieHN1cXVjdnZzdGRyYmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjQxOTQsImV4cCI6MjA4MDY0MDE5NH0.HGCg3QahxTSrRsphxu0SzH89bk-dARqUsINAtg3y-AA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection...\n');
  
  try {
    // Test 1: Check connection
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.log('❌ Connection Error:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
    }
    
    // Test 2: Try to create a test account
    console.log('\n📝 Creating test account...');
    const testEmail = 'test@prosperly.com';
    const testPassword = 'Test123456!';
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.log('⚠️  Account creation:', signUpError.message);
    } else {
      console.log('✅ Test account created!');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testConnection();
