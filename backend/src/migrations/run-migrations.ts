import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    const migrationFile = fs.readFileSync(
      path.join(__dirname, '001_create_tables.sql'),
      'utf-8'
    );
    
    await pool.query(migrationFile);
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
