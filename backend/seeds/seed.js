const bcrypt = require('bcryptjs');
const { pool } = require('../db/index');
const { fakerEN_IN: faker } = require('@faker-js/faker');

const DEPARTMENTS = ['Computer Science & Engineering', 'Electronics & Communication Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'];
const SUBJECTS = {
  'Computer Science & Engineering': ['Data Structures', 'Algorithms', 'Operating Systems', 'Database Systems', 'Computer Networks'],
  'Electronics & Communication Engineering': ['Signals and Systems', 'Digital Electronics', 'Analog Circuits', 'Communication Systems'],
  'Electrical Engineering': ['Power Systems', 'Control Systems', 'Electrical Machines', 'Power Electronics'],
  'Mechanical Engineering': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes'],
  'Civil Engineering': ['Structural Analysis', 'Geotechnical Engineering', 'Transportation Engineering', 'Environmental Engineering']
};

async function seed() {
  try {
    console.log('Seeding database with massive demo data...');
    
    // The tables will be recreated by the migration script which we should run first.
    // For safety during seeding, we could truncate, but let's assume it's running after fresh migration.
    await pool.query('TRUNCATE users CASCADE');

    const adminHash = await bcrypt.hash('Demo@12345', 10);
    const facultyHash = await bcrypt.hash('Demo@12345', 10);
    const studentHash = await bcrypt.hash('Demo@12345', 10);

    // --- ADMIN ---
    console.log('Creating Admin...');
    const adminRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin') RETURNING id",
      ['admin@nexcampus.demo', adminHash]
    );
    const adminId = adminRes.rows[0].id;

    // --- FACULTY ---
    console.log('Creating Faculty...');
    const facultyIds = [];
    const facultyUsers = [];
    
    // Fixed faculty 1
    const fUserRes1 = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'faculty') RETURNING id",
      ['faculty1@nexcampus.demo', facultyHash]
    );
    const fRes1 = await pool.query(
      "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, department",
      [fUserRes1.rows[0].id, 'FAC-001', 'Arjun', 'Kumar', DEPARTMENTS[0], 'Professor']
    );
    facultyIds.push(fRes1.rows[0].id);
    facultyUsers.push({ id: fRes1.rows[0].id, user_id: fUserRes1.rows[0].id, dept: fRes1.rows[0].department });

    // 4 more random faculty
    for(let i=2; i<=5; i++) {
      const fUser = await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'faculty') RETURNING id",
        [`faculty${i}@nexcampus.demo`, facultyHash]
      );
      const dept = faker.helpers.arrayElement(DEPARTMENTS);
      const fRes = await pool.query(
        "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, department",
        [fUser.rows[0].id, `FAC-00${i}`, faker.person.firstName(), faker.person.lastName(), dept, 'Assistant Professor']
      );
      facultyIds.push(fRes.rows[0].id);
      facultyUsers.push({ id: fRes.rows[0].id, user_id: fUser.rows[0].id, dept: dept });
    }

    // --- STUDENTS ---
    console.log('Creating Students...');
    const studentIds = [];
    const studentUsers = [];

    // Fixed student 1
    const sUserRes1 = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'student') RETURNING id",
      ['student1@nexcampus.demo', studentHash]
    );
    const sRes1 = await pool.query(
      "INSERT INTO students (user_id, student_id, roll_number, first_name, last_name, phone, department, course, semester, section, admission_year, dob, batch) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, department",
      [sUserRes1.rows[0].id, 'STU-001', '25CSE101', 'Riya', 'Sharma', '9876543210', DEPARTMENTS[0], 'B.Tech', 3, 'A', 2024, '2005-04-15', '2028']
    );
    studentIds.push(sRes1.rows[0].id);
    studentUsers.push({ id: sRes1.rows[0].id, user_id: sUserRes1.rows[0].id, dept: sRes1.rows[0].department });

    // 29 more random students
    for(let i=2; i<=30; i++) {
      const sUser = await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'student') RETURNING id",
        [`student${i}@nexcampus.demo`, studentHash]
      );
      const dept = faker.helpers.arrayElement(DEPARTMENTS);
      const sem = faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7, 8]);
      const sRes = await pool.query(
        "INSERT INTO students (user_id, student_id, roll_number, first_name, last_name, phone, department, course, semester, section, admission_year, dob, batch) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, department",
        [
          sUser.rows[0].id, 
          `STU-${i.toString().padStart(3, '0')}`, 
          `${28-Math.floor(sem/2)}${dept.substring(0,3).toUpperCase()}${i}`,
          faker.person.firstName(), 
          faker.person.lastName(), 
          faker.phone.number({ style: 'national' }),
          dept, 
          'B.Tech', 
          sem, 
          faker.helpers.arrayElement(['A', 'B', 'C']),
          2025 - Math.floor(sem/2),
          faker.date.birthdate({ min: 18, max: 24, mode: 'age' }),
          `${2025 - Math.floor(sem/2) + 4}`
        ]
      );
      studentIds.push(sRes.rows[0].id);
      studentUsers.push({ id: sRes.rows[0].id, user_id: sUser.rows[0].id, dept: dept });
    }

    // --- TIMETABLE ---
    console.log('Creating Timetable...');
    for (const fac of facultyUsers) {
      const subjects = SUBJECTS[fac.dept] || ['General Studies'];
      for(let i=0; i<5; i++) {
        await pool.query(
          "INSERT INTO timetable (department, semester, section, day_of_week, start_time, end_time, subject, faculty_id, room_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [
            fac.dept,
            faker.helpers.arrayElement([1,2,3,4,5,6,7,8]),
            faker.helpers.arrayElement(['A', 'B']),
            faker.helpers.arrayElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
            `${faker.number.int({min:9, max:14})}:00:00`,
            `${faker.number.int({min:10, max:15})}:00:00`,
            faker.helpers.arrayElement(subjects),
            fac.id,
            `Room ${faker.number.int({min:100, max:500})}`
          ]
        );
      }
    }

    // --- ATTENDANCE ---
    console.log('Creating Attendance...');
    for (const stu of studentUsers) {
      const subjects = SUBJECTS[stu.dept] || ['General Studies'];
      for(let i=0; i<10; i++) {
        const date = faker.date.recent({ days: 30 });
        try {
          await pool.query(
            "INSERT INTO attendance (student_id, faculty_id, subject, date, status) VALUES ($1, $2, $3, $4, $5)",
            [
              stu.id,
              faker.helpers.arrayElement(facultyIds),
              faker.helpers.arrayElement(subjects),
              date,
              faker.helpers.arrayElement(['present', 'present', 'present', 'absent', 'late']) // 60% present
            ]
          );
        } catch(e) {
          // ignore unique constraint violations for same day/subject
        }
      }
    }

    // --- NOTICES ---
    console.log('Creating Notices...');
    for(let i=0; i<15; i++) {
      await pool.query(
        "INSERT INTO notices (title, description, category, priority, target_audience, created_by) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          faker.company.catchPhrase(),
          faker.lorem.paragraphs(2),
          faker.helpers.arrayElement(['Academic', 'Event', 'Administrative', 'Exam']),
          faker.helpers.arrayElement(['low', 'normal', 'high']),
          faker.helpers.arrayElement(['everyone', 'students', 'faculty']),
          adminId
        ]
      );
    }

    // --- LEAVE REQUESTS ---
    console.log('Creating Leave Requests...');
    for(let i=0; i<20; i++) {
      await pool.query(
        "INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason, status) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          faker.helpers.arrayElement(studentIds),
          faker.helpers.arrayElement(['Sick Leave', 'Personal Leave', 'Event Participation']),
          faker.date.recent({ days: 10 }),
          faker.date.soon({ days: 5 }),
          faker.lorem.sentence(),
          faker.helpers.arrayElement(['pending', 'approved', 'rejected'])
        ]
      );
    }

    // --- GATE PASSES ---
    console.log('Creating Gate Passes...');
    for(let i=0; i<15; i++) {
      await pool.query(
        "INSERT INTO gate_pass_requests (student_id, date, time, destination, reason, is_emergency, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          faker.helpers.arrayElement(studentIds),
          faker.date.soon({ days: 2 }),
          `${faker.number.int({min:10, max:18})}:00:00`,
          faker.location.city(),
          faker.lorem.sentence(),
          faker.datatype.boolean(),
          faker.helpers.arrayElement(['pending', 'approved', 'rejected', 'completed'])
        ]
      );
    }

    // --- COMPLAINTS ---
    console.log('Creating Complaints...');
    for(let i=0; i<15; i++) {
      await pool.query(
        "INSERT INTO hostel_complaints (student_id, category, room_number, description, priority, status) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          faker.helpers.arrayElement(studentIds),
          faker.helpers.arrayElement(['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Furniture', 'Other']),
          `H-${faker.number.int({min:100, max:500})}`,
          faker.lorem.sentence(),
          faker.helpers.arrayElement(['low', 'normal', 'high']),
          faker.helpers.arrayElement(['submitted', 'in_progress', 'resolved', 'rejected'])
        ]
      );
    }
    for(let i=0; i<10; i++) {
      await pool.query(
        "INSERT INTO mess_complaints (student_id, description, status) VALUES ($1, $2, $3)",
        [
          faker.helpers.arrayElement(studentIds),
          faker.lorem.sentence(),
          faker.helpers.arrayElement(['submitted', 'in_progress', 'resolved', 'closed'])
        ]
      );
    }

    // --- CERTIFICATES ---
    console.log('Creating Certificate Requests...');
    for(let i=0; i<10; i++) {
      await pool.query(
        "INSERT INTO certificates (student_id, certificate_type, status) VALUES ($1, $2, $3)",
        [
          faker.helpers.arrayElement(studentIds),
          faker.helpers.arrayElement(['Bonafide Certificate', 'Character Certificate', 'Study Certificate']),
          faker.helpers.arrayElement(['pending', 'approved', 'rejected', 'ready'])
        ]
      );
    }

    // --- FEE QUERIES ---
    console.log('Creating Fee Queries...');
    for(let i=0; i<8; i++) {
      await pool.query(
        "INSERT INTO fee_queries (student_id, category, description, status) VALUES ($1, $2, $3, $4)",
        [
          faker.helpers.arrayElement(studentIds),
          faker.helpers.arrayElement(['Tuition fee', 'Hostel fee', 'Examination fee']),
          faker.lorem.sentence(),
          faker.helpers.arrayElement(['pending', 'in_progress', 'resolved'])
        ]
      );
    }

    // --- NOTIFICATIONS ---
    console.log('Creating Notifications...');
    for(const u of [...studentUsers, ...facultyUsers, {user_id: adminId}]) {
      for(let i=0; i<3; i++) {
        await pool.query(
          "INSERT INTO notifications (user_id, title, message, is_read) VALUES ($1, $2, $3, $4)",
          [
            u.user_id,
            faker.helpers.arrayElement(['System Update', 'New Notice', 'Request Update']),
            faker.lorem.sentence(),
            faker.datatype.boolean()
          ]
        );
      }
    }

    console.log('Database seeded successfully!');
    console.log('\n--- DEMO ACCOUNTS ---');
    console.log('Admin: admin@nexcampus.demo / Demo@12345');
    console.log('Faculty: faculty1@nexcampus.demo / Demo@12345');
    console.log('Student: student1@nexcampus.demo / Demo@12345');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
