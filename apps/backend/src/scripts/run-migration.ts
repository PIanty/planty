import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load env
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const { SUPABASE_URL, SUPABASE_JUSROLE } = process.env;

if (!SUPABASE_URL || !SUPABASE_JUSROLE) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

async function runMigration() {
  console.log('Starting database migration...');
  
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_JUSROLE);
    console.log('Connected to Supabase');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../../../..', 'justscheme.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL commands
    const commands = sqlContent
      .split(';')
      .filter(cmd => cmd.trim().length > 0)
      .map(cmd => cmd.trim() + ';');
    
    console.log(`Found ${commands.length} SQL commands to execute`);
    
    // Execute each command
    for (const [index, command] of commands.entries()) {
      console.log(`Executing command ${index + 1}/${commands.length}...`);
      
      const { error } = await supabase.rpc('pgql', { query: command });
      
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        console.error('Command:', command);
      } else {
        console.log(`Command ${index + 1} executed successfully`);
      }
    }
    
    console.log('Migration completed');
    
    // Check if the table exists now
    const { error } = await supabase
      .from('submission_history')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Table check failed:', error.message);
    } else {
      console.log('Table submission_history exists and is accessible');
    }
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
}

runMigration(); 