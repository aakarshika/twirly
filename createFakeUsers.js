import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env.local
dotenv.config({ path: path.resolve('.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // must be the service role key

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PASSWORD = '12345678';

async function createFakeUsers() {
  for (let i = 1; i <= 10; i++) {
    const email = `testuser${i}@example.com`;
    const { error } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });

    if (error) {
      console.error(`❌ Failed to create ${email}:`, error.message);
    } else {
      console.log(`✅ Created ${email}`);
    }
  }
}

createFakeUsers();
