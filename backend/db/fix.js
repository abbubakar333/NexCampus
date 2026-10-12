const { pool } = require('./index');
async function fix() {
    try {
        console.log('Dropping new tables...');
        await pool.query('DROP TABLE IF EXISTS complaints CASCADE;');
        await pool.query('DROP TABLE IF EXISTS payments CASCADE;');
        await pool.query('DROP TABLE IF EXISTS fees CASCADE;');
        await pool.query('DROP TABLE IF EXISTS examinations CASCADE;');
        await pool.query('DROP TABLE IF EXISTS mess_menus CASCADE;');
        console.log('Done dropping.');
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
fix();
