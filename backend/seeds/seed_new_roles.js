const bcrypt = require('bcryptjs');
const { pool } = require('../db/index');
const { faker } = require('@faker-js/faker');

const DEPARTMENTS = ['Computer Science & Engineering', 'Electronics & Communication Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'];
const DEPT_CODES = ['CSE', 'ECE', 'EE', 'ME', 'CE'];

async function seedNewRoles() {
  try {
    console.log('Seeding new roles and demo data...');
    const defaultPassword = await bcrypt.hash('Demo@12345', 10);

    // 1. Create HODs
    for (let i = 0; i < DEPARTMENTS.length; i++) {
      const dept = DEPARTMENTS[i];
      const code = DEPT_CODES[i].toLowerCase();
      const userRes = await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'hod') RETURNING id",
        [`hod_${code}@nexcampus.demo`, defaultPassword]
      );
      await pool.query(
        "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6)",
        [userRes.rows[0].id, `HOD-${code.toUpperCase()}`, faker.person.firstName(), faker.person.lastName(), dept, 'Head of Department']
      );
    }

    // 2. Create Incharges
    const incharges = [
      { email: 'hostel_incharge@nexcampus.demo', role: 'hostel_incharge', prefix: 'HST' },
      { email: 'gate_incharge@nexcampus.demo', role: 'gate_incharge', prefix: 'GAT' },
      { email: 'mess_incharge@nexcampus.demo', role: 'mess_incharge', prefix: 'MES' },
      { email: 'account_incharge@nexcampus.demo', role: 'account_section_incharge', prefix: 'ACC' },
      { email: 'exam_incharge@nexcampus.demo', role: 'examination_section_incharge', prefix: 'EXM' }
    ];

    for (const inc of incharges) {
      const userRes = await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
        [inc.email, defaultPassword, inc.role]
      );
      await pool.query(
        "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6)",
        [userRes.rows[0].id, `INC-${inc.prefix}`, faker.person.firstName(), faker.person.lastName(), 'Administration', 'Incharge']
      );
    }

    // 3. Create Mess Menus
    const meals = ['Breakfast', 'Lunch', 'Dinner'];
    const bItems = ['Idli, Sambar, Chutney', 'Dosa, Sambar', 'Poha, Jalebi', 'Upma, Banana', 'Aloo Paratha, Curd'];
    const lItems = ['Rice, Dal, Paneer, Roti', 'Rice, Rajma, Salad, Roti', 'Rice, Chicken/Soy, Dal', 'Veg Biryani, Raita', 'Rice, Dal, Mix Veg'];
    const dItems = ['Roti, Dal Tadka, Aloo Gobi', 'Roti, Dal, Palak Paneer', 'Roti, Chana Masala', 'Fried Rice, Manchurian', 'Roti, Egg Curry/Dal'];

    for (let i = -2; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      await pool.query(
        "INSERT INTO mess_menus (date, meal_type, items) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [dateStr, 'Breakfast', faker.helpers.arrayElement(bItems)]
      );
      await pool.query(
        "INSERT INTO mess_menus (date, meal_type, items) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [dateStr, 'Lunch', faker.helpers.arrayElement(lItems)]
      );
      await pool.query(
        "INSERT INTO mess_menus (date, meal_type, items) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [dateStr, 'Dinner', faker.helpers.arrayElement(dItems)]
      );
    }

    // Fetch existing students
    const studentRes = await pool.query("SELECT id, department, semester FROM students");
    const students = studentRes.rows;

    // 4. Create Examinations
    const subjects = ['Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Machine Learning'];
    for (const dept of DEPARTMENTS) {
      for (let sem = 1; sem <= 8; sem++) {
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() + faker.number.int({min: 5, max: 20}));
            await pool.query(
            "INSERT INTO examinations (exam_type, department, semester, subject, exam_date, start_time, end_time, duration, room, instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            [
                faker.helpers.arrayElement(['Internal Examination', 'Mid-Semester Examination', 'Semester Examination']),
                dept,
                sem,
                subjects[i % subjects.length],
                date.toISOString().split('T')[0],
                '10:00:00',
                '13:00:00',
                '3 Hours',
                `Room ${faker.number.int({min:101, max:405})}`,
                'Bring ID card.'
            ]
            );
        }
      }
    }

    // 5. Create Fees & Payments
    for (const st of students) {
      const amount = faker.number.int({min: 40000, max: 100000});
      const isPaid = faker.datatype.boolean();
      const paid = isPaid ? amount : (faker.datatype.boolean() ? faker.number.int({min: 10000, max: amount-10000}) : 0);
      const status = paid === amount ? 'paid' : (paid > 0 ? 'partial' : 'pending');

      const feeRes = await pool.query(
        "INSERT INTO fees (student_id, total_amount, paid_amount, due_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [st.id, amount, paid, faker.date.future().toISOString().split('T')[0], status]
      );

      if (paid > 0) {
        await pool.query(
          "INSERT INTO payments (student_id, fee_id, amount, transaction_id, method, status) VALUES ($1, $2, $3, $4, $5, $6)",
          [st.id, feeRes.rows[0].id, paid, `TXN${faker.string.alphanumeric(10).toUpperCase()}`, faker.helpers.arrayElement(['UPI', 'Net Banking', 'Credit Card']), 'success']
        );
      }
      
      // Also add a general complaint
      if (faker.datatype.boolean()) {
          await pool.query(
              "INSERT INTO complaints (student_id, title, category, description, status) VALUES ($1, $2, $3, $4, $5)",
              [st.id, faker.lorem.words(3), faker.helpers.arrayElement(['Academic', 'Library', 'Transport', 'General']), faker.lorem.sentence(), faker.helpers.arrayElement(['Submitted', 'In Progress', 'Resolved'])]
          );
      }
    }

    console.log('New roles and demo data seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seedNewRoles();
