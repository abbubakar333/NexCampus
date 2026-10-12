require('dotenv').config();
const { pool } = require('./db');

async function test() {
  try {
    const res = await pool.query(`SELECT id, email, role FROM users WHERE role IN ('hostel_incharge', 'mess_incharge', 'faculty')`);
    console.log("Users:", res.rows);

    for (let u of res.rows) {
      const facRes = await pool.query(`SELECT * FROM faculty WHERE user_id = $1`, [u.id]);
      console.log(`Faculty record for ${u.role}:`, facRes.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
test();
