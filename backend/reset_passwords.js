const bcrypt = require('bcryptjs');
const { pool } = require('./db/index');

async function reset() {
  try {
    const hash = await bcrypt.hash('Demo@12345', 10);
    await pool.query('UPDATE users SET password_hash = $1', [hash]);
    console.log('All passwords reset successfully');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
reset();
