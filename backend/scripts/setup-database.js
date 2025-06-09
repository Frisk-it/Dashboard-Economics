const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const { supabase } = require('../src/config/supabase');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    const migrationSql = await fs.readFile(migrationPath, 'utf8');

    console.log('📖 Running migration...');

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });

    if (error) {
      // If rpc doesn't work, try with exec
      const lines = migrationSql.split(';').filter(line => line.trim());

      for (const line of lines) {
        if (line.trim()) {
          const { error: execError } = await supabase
            .from('_dummy')
            .select('*')
            .limit(0); // This is just to test connection

          // Since we can't use exec directly, we'll output instructions
          console.log('⚠️  Please run the migration manually in Supabase SQL Editor');
          console.log('📄 Migration content is ready in: supabase/migrations/001_initial_schema.sql');
          return;
        }
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log('🎉 Your tables are ready to use.');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('');
    console.log('📝 Manual Setup Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the content from: backend/supabase/migrations/001_initial_schema.sql');
    console.log('4. Click Run to execute the migration');
  }
}

// Run the setup
setupDatabase();