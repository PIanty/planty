import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load env
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const { SUPABASE_URL, SUPABASE_JUSROLE } = process.env;

if (!SUPABASE_URL || !SUPABASE_JUSROLE) {
  console.error('❌ ERROR: Missing Supabase credentials in environment variables');
  process.exit(1);
}

async function testConnection() {
  console.log('=== TESTING SUPABASE CONNECTION & SETUP ===');
  console.log(`🔌 Connecting to: ${SUPABASE_URL}`);
  
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_JUSROLE);
    
    // Test 1: Check if we can connect
    const { data: testData, error: testError } = await supabase.auth.getSession();
    if (testError) {
      console.error('❌ ERROR: Failed to connect to Supabase:', testError.message);
      process.exit(1);
    }
    console.log('✅ Connection successful!');
    
    // Test 2: Check if submission_history table exists
    console.log('🔍 Checking if submission_history table exists...');
    const { data: tableData, error: tableError } = await supabase
      .from('submission_history')
      .select('count(*)');
    
    if (tableError) {
      console.error('❌ ERROR: Table check failed:', tableError.message);
      console.log('👉 Please run the SQL setup script from the setup instructions');
      process.exit(1);
    }
    console.log('✅ Table submission_history exists and is accessible!');
    
    // Test 3: Check storage buckets
    console.log('🔍 Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ ERROR: Failed to list storage buckets:', bucketsError.message);
      process.exit(1);
    }
    
    const receiptsBucket = buckets.find(bucket => bucket.name === 'receipts');
    if (!receiptsBucket) {
      console.error('❌ ERROR: receipts bucket not found!');
      console.log('👉 Please create a "receipts" bucket in Supabase Storage');
      process.exit(1);
    }
    
    console.log('✅ receipts bucket exists!');
    
    // All tests passed
    console.log('\n🎉 ALL TESTS PASSED! Your Supabase setup is correct.');
    console.log('You can now run the application and it should work properly.');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testConnection(); 