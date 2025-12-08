#!/usr/bin/env node

/**
 * Comprehensive Auth Flow Test Script
 * Tests the complete authentication flow including:
 * 1. User sign-in
 * 2. Session management
 * 3. User profile retrieval
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/app/frontend/.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('\n🧪 Starting Comprehensive Auth Flow Test\n');
  console.log('═'.repeat(60));

  // Test credentials
  const email = 'demo@prosperly.com';
  const password = 'Demo123456!';

  try {
    // Step 1: Sign In
    console.log('\n📝 Step 1: Testing Sign In...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('❌ Sign In Failed:', signInError.message);
      return;
    }

    console.log('✅ Sign In Successful!');
    console.log('   User ID:', signInData.user.id);
    console.log('   Email:', signInData.user.email);

    // Step 2: Verify Session
    console.log('\n📝 Step 2: Verifying Session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('❌ Session Retrieval Failed');
      return;
    }

    console.log('✅ Session Retrieved Successfully!');
    console.log('   Access Token:', session.access_token.substring(0, 20) + '...');
    console.log('   Expires At:', new Date(session.expires_at * 1000).toLocaleString());

    // Step 3: Get User Profile
    console.log('\n📝 Step 3: Fetching User Profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile Fetch Failed:', profileError.message);
      return;
    }

    console.log('✅ Profile Retrieved Successfully!');
    console.log('   Name:', profile.name);
    console.log('   Email:', profile.email);
    console.log('   Total Payments:', profile.total_payments);
    console.log('   On-Time Payments:', profile.on_time_payments);

    // Step 4: Fetch Transactions
    console.log('\n📝 Step 4: Fetching User Transactions...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', signInData.user.id)
      .order('created_at', { ascending: false });

    if (transError) {
      console.error('❌ Transactions Fetch Failed:', transError.message);
      return;
    }

    console.log(`✅ Found ${transactions.length} Transactions!`);
    
    // Show transaction summary
    const lentAmount = transactions
      .filter(t => t.type === 'lend')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const borrowedAmount = transactions
      .filter(t => t.type === 'borrow')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    console.log('   Total Lent: $' + lentAmount.toFixed(2));
    console.log('   Total Borrowed: $' + borrowedAmount.toFixed(2));

    // Step 5: Sign Out
    console.log('\n📝 Step 5: Testing Sign Out...');
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('❌ Sign Out Failed:', signOutError.message);
      return;
    }

    console.log('✅ Sign Out Successful!');

    // Step 6: Verify Session Cleared
    console.log('\n📝 Step 6: Verifying Session Cleared...');
    const { data: { session: postLogoutSession } } = await supabase.auth.getSession();

    if (postLogoutSession) {
      console.error('❌ Session still exists after logout!');
      return;
    }

    console.log('✅ Session Cleared Successfully!');

    // Final Summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ ALL AUTH TESTS PASSED!');
    console.log('═'.repeat(60));
    console.log('\n🎉 Authentication flow is working correctly!\n');
    console.log('Next Steps:');
    console.log('  1. Test login in the app with: demo@prosperly.com / Demo123456!');
    console.log('  2. Verify automatic navigation to dashboard');
    console.log('  3. Check that user data displays correctly\n');

  } catch (error) {
    console.error('\n❌ Unexpected Error:', error.message);
    console.error(error);
  }
}

// Run the test
testAuthFlow();
