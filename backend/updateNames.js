const { pool } = require('./db/index');
const { fakerEN_IN: faker } = require('@faker-js/faker');

const HOD_NAMES = [
  'Dr. Pradeep Kumar',
  'Dr. Sushant Mohanty',
  'Dr. Meera Das',
  'Dr. Swati Mishra',
  'Dr. Rakesh Nayak'
];

const INCHARGE_NAMES = [
  'Prof. Rajesh Kumar',
  'Prof. Sandeep Mohanty',
  'Prof. Ananya Mishra',
  'Prof. Priyanka Das',
  'Prof. Amit Sharma'
];

async function updateData() {
  try {
    console.log('Starting data update...');
    
    // 1. Update Faculty Names
    const facultyRes = await pool.query("SELECT id, designation FROM faculty");
    let hodIndex = 0;
    let incIndex = 0;
    
    for (const fac of facultyRes.rows) {
      let firstName, lastName;
      
      if (fac.designation === 'Head of Department' && hodIndex < HOD_NAMES.length) {
        const parts = HOD_NAMES[hodIndex].split(' ');
        firstName = parts.slice(0, -1).join(' '); // e.g. Dr. Pradeep
        lastName = parts[parts.length - 1];       // e.g. Kumar
        hodIndex++;
      } else if (fac.designation === 'Incharge' && incIndex < INCHARGE_NAMES.length) {
        const parts = INCHARGE_NAMES[incIndex].split(' ');
        firstName = parts.slice(0, -1).join(' ');
        lastName = parts[parts.length - 1];
        incIndex++;
      } else {
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
      }
      
      await pool.query("UPDATE faculty SET first_name = $1, last_name = $2 WHERE id = $3", [firstName, lastName, fac.id]);
    }
    console.log('Faculty names updated to Indian names.');

    // 2. Update Student Names & Hostel Allocation
    const studentRes = await pool.query("SELECT id, department, semester FROM students");
    const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D'];
    
    for (const st of studentRes.rows) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      // Randomly assign as hosteller or day scholar
      const isHosteller = faker.datatype.boolean(); // 50% chance
      
      let hostelStatus = 'day_scholar';
      let hostelBlock = null;
      let roomNumber = null;
      
      if (isHosteller) {
        hostelStatus = 'hosteller';
        hostelBlock = faker.helpers.arrayElement(BLOCKS);
        // Room numbers like A-101
        const prefix = hostelBlock.split(' ')[1]; 
        const floor = faker.number.int({ min: 1, max: 4 });
        const room = faker.number.int({ min: 1, max: 20 }).toString().padStart(2, '0');
        roomNumber = `${prefix}-${floor}${room}`;
      }
      
      await pool.query(
        "UPDATE students SET first_name = $1, last_name = $2, hostel_status = $3, hostel_block = $4, room_number = $5 WHERE id = $6",
        [firstName, lastName, hostelStatus, hostelBlock, roomNumber, st.id]
      );
    }
    console.log('Student names and hostel allocations updated.');

    console.log('Update completed successfully.');
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await pool.end();
  }
}

updateData();
