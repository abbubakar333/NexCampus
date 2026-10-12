const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/003_feature_updates.sql'), 'utf8');
    await pool.query(sql);
    console.log('003_feature_updates.sql applied successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
