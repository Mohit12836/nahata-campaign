import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local if present
try {
  if (process.loadEnvFile) {
    process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
  } else if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
} catch {}

async function testSupabaseConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('================================================================');
  console.log('SUPABASE CONNECTION DIAGNOSTIC CHECK');
  console.log('================================================================');

  if (!url || !key) {
    console.log('❌ STATUS: Supabase credentials NOT configured in environment.');
    console.log('\nMissing variables:');
    if (!url) console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    if (!key) console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY');
    console.log('\n👉 Instructions:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Open Project Settings -> API');
    console.log('3. Copy "Project URL" and "anon / public key"');
    console.log('4. Add them to your .env.local file or Vercel Environment Variables');
    console.log('================================================================');
    process.exit(1);
  }

  console.log(`Connecting to: ${url}...`);
  const client = createClient(url, key);

  try {
    const { data, error } = await client.from('merchants').select('id, name, slug').limit(5);

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️ STATUS: Connected to Supabase, but schema tables are not created yet!');
        console.log('👉 Please execute "supabase/migrations/20261010_nahata_campaign_schema.sql"');
        console.log('   in your Supabase Dashboard -> SQL Editor.');
      } else {
        console.log(`❌ STATUS: Connection failed with error: ${error.message} (Code: ${error.code})`);
      }
      process.exit(1);
    }

    console.log('✅ STATUS: Supabase connected successfully!');
    console.log(`Found ${data.length} merchants in cloud database:`);
    data.forEach((m) => console.log(`  - ${m.name} (/store/${m.slug})`));
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Connection error:', err);
    process.exit(1);
  }
}

testSupabaseConnection();
