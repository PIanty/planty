import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load env
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const { SUPABASE_URL } = process.env;

async function showInstructions() {
  console.log('=== SUPABASE SETUP INSTRUCTIONS ===');
  console.log('');
  
  // Check if we have Supabase URL
  if (SUPABASE_URL) {
    console.log(`Your Supabase project: ${SUPABASE_URL}`);
  } else {
    console.log('WARNING: No SUPABASE_URL found in environment variables!');
  }
  
  console.log('');
  console.log('FOLLOW THESE STEPS TO SET UP YOUR DATABASE:');
  console.log('');
  console.log('1. Login to your Supabase dashboard');
  console.log('2. Go to "SQL Editor"');
  console.log('3. Create a "New query"');
  console.log('4. Copy and paste the following SQL:');
  console.log('');
  
  // Read the SQL file
  const sqlFilePath = path.join(__dirname, '../../../..', 'justscheme.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  console.log('```');
  console.log(sqlContent);
  console.log('```');
  
  console.log('');
  console.log('5. Click "Run" to execute the SQL');
  console.log('');
  console.log('STORAGE SETUP:');
  console.log('1. Go to "Storage" in your Supabase dashboard');
  console.log('2. Create a new bucket called "receipts"');
  console.log('3. Set the bucket visibility to "Public"');
  console.log('');
  console.log('Once done, restart your backend server.');
}

showInstructions(); 