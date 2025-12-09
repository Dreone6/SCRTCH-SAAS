#!/usr/bin/env node

/**
 * Setup Loans Schema in Supabase
 * This script executes the SQL schema to create all loan-related tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '/app/frontend/.env' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSchema() {
  console.log('\n🔧 Setting up Prosperly Loans Schema in Supabase\n');
  console.log('═'.repeat(60));

  try {
    // Read the SQL file
    const sqlFile = fs.readFileSync('/app/frontend/supabase-loans-schema.sql', 'utf8');
    
    // Split into individual statements (basic split by semicolon)
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n📝 Found ${statements.length} SQL statements to execute\n`);

    // Note: The Supabase JS client doesn't support direct SQL execution
    // Users need to run this in the Supabase SQL Editor
    console.log('⚠️  IMPORTANT: The Supabase JS client cannot execute raw SQL directly.');
    console.log('');
    console.log('Please follow these steps:');
    console.log('');
    console.log('1. Open your Supabase project dashboard');
    console.log('2. Go to the SQL Editor');
    console.log('3. Copy the contents of: /app/frontend/supabase-loans-schema.sql');
    console.log('4. Paste into the SQL Editor');
    console.log('5. Click "Run" to execute');
    console.log('');
    console.log('📄 Schema file location: /app/frontend/supabase-loans-schema.sql');
    console.log('');
    console.log('═'.repeat(60));
    console.log('\n✅ Schema file is ready to be executed in Supabase!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupSchema();
