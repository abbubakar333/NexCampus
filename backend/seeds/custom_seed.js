const bcrypt = require('bcryptjs');
const { pool } = require('../db/index');

const STUDENTS_DATA = [
  'Aarav Sharma', 'Ananya Patel', 'Rohan Verma', 'Priya Mishra', 'Aditya Das',
  'Sneha Reddy', 'Rahul Singh', 'Kavya Nair', 'Arjun Mohanty', 'Pooja Sahu',
  'Abhishek Rath', 'Ishita Pradhan', 'Vikram Naidu', 'Divya Kumari', 'Satyajit Behera',
  'Swati Panda', 'Kunal Tripathy', 'Riya Mahapatra', 'Subham Patra', 'Nandini Rao',
  'Debashish Nayak', 'Tanisha Sahoo', 'Pratik Mishra', 'Shreya Mohanty', 'Akash Jena',
  'Neha Agarwal', 'Saurav Dash', 'Aditi Choudhury', 'Rajesh Kumar', 'Shruti Singh',
  'Manish Yadav', 'Kritika Sharma', 'Deepak Rout', 'Anjali Gupta', 'Harsh Vardhan',
  'Sasmita Das', 'Rohit Pradhan', 'Pallavi Mishra', 'Mohammed Ayaan Khan', 'Ayesha Fatima',
  'Ahmed Raza', 'Sana Parveen', 'Faizan Ali', 'Zoya Rahman', 'Rehan Ahmed',
  'Gurpreet Singh', 'Harleen Kaur', 'Jaspreet Singh', 'John Mathew', 'Maria D\'Souza'
];

const DEPARTMENTS = [
  { name: 'Computer Science & Engineering', code: 'CSE' },
  { name: 'Electrical Engineering', code: 'EE' },
  { name: 'Electronics & Communication Engineering', code: 'ECE' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Civil Engineering', code: 'CE' }
];

const HODS = [
  { dept: 'Computer Science & Engineering', name: 'Dr. Pradeep Mohanty' },
  { dept: 'Electrical Engineering', name: 'Dr. Sunita Mishra' },
  { dept: 'Electronics & Communication Engineering', name: 'Dr. Sanjay Kumar' },
  { dept: 'Mechanical Engineering', name: 'Dr. Aparna Das' },
  { dept: 'Civil Engineering', name: 'Dr. Rakesh Choudhury' }
];

const FACULTY = [
  { dept: 'Computer Science & Engineering', names: ['Dr. Rajesh Kumar', 'Anjali Mohanty'] },
  { dept: 'Electrical Engineering', names: ['Sandeep Pradhan', 'Priyanka Das'] },
  { dept: 'Electronics & Communication Engineering', names: ['Amitabh Mishra', 'Swati Nayak'] },
  { dept: 'Mechanical Engineering', names: ['Vikash Ranjan', 'Niharika Sahoo'] },
  { dept: 'Civil Engineering', names: ['Abhishek Patnaik', 'Monalisa Rout'] }
];

const INCHARGES = [
  { role: 'hostel_incharge', name: 'Jagannath Sahu', email: 'hostel_incharge@nexcampus.demo' },
  { role: 'gate_incharge', name: 'Ramesh Pradhan', email: 'gate_incharge@nexcampus.demo' },
  { role: 'mess_incharge', name: 'Bina Pani', email: 'mess_incharge@nexcampus.demo' },
  { role: 'account_section_incharge', name: 'Pati Satpathy', email: 'account_incharge@nexcampus.demo' },
  { role: 'examination_section_incharge', name: 'Ajit Satpathy', email: 'exam_incharge@nexcampus.demo' }
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function run() {
  try {
    console.log('Starting custom seed...');
    await pool.query('TRUNCATE users CASCADE');
    
    const defaultPassword = await bcrypt.hash('Demo@12345', 10);

    // 1. Primary Admin
    console.log('Creating Admin...');
    const adminUser = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin') RETURNING id",
      ['admin@nexcampus.demo', defaultPassword]
    );
    // Since there is no admin table, we will put Dr. Akash Singh in faculty table as College Administrator
    await pool.query(
      "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6)",
      [adminUser.rows[0].id, 'ADM-001', 'Dr. Akash', 'Singh', 'Administration', 'College Administrator']
    );

    // 2. Incharges
    console.log('Creating Incharges...');
    for (const inc of INCHARGES) {
      const userRes = await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
        [inc.email, defaultPassword, inc.role]
      );
      const [firstName, ...lastNameParts] = inc.name.split(' ');
      const lastName = lastNameParts.join(' ');
      await pool.query(
        "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6)",
        [userRes.rows[0].id, `INC-${inc.role.substring(0,3).toUpperCase()}`, firstName, lastName, 'Administration', 'Incharge']
      );
    }

    // 3. HODs
    console.log('Creating HODs...');
    for (const hod of HODS) {
      const deptCode = DEPARTMENTS.find(d => d.name === hod.dept).code.toLowerCase();
      const userRes = await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'hod') RETURNING id",
        [`hod_${deptCode}@nexcampus.demo`, defaultPassword]
      );
      const [firstName, ...lastNameParts] = hod.name.replace('Dr. ', '').split(' ');
      const lastName = lastNameParts.join(' ');
      await pool.query(
        "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6)",
        [userRes.rows[0].id, `HOD-${deptCode.toUpperCase()}`, `Dr. ${firstName}`, lastName, hod.dept, 'Head of Department']
      );
    }

    // 4. Faculty
    console.log('Creating Faculty...');
    let facCounter = 1;
    for (const fac of FACULTY) {
      for (const name of fac.names) {
        const userRes = await pool.query(
          "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'faculty') RETURNING id",
          [`faculty${facCounter}@nexcampus.demo`, defaultPassword]
        );
        let firstName, lastName;
        if (name.startsWith('Dr. ')) {
            const parts = name.replace('Dr. ', '').split(' ');
            firstName = `Dr. ${parts[0]}`;
            lastName = parts.slice(1).join(' ');
        } else {
            const parts = name.split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
        }
        await pool.query(
          "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6)",
          [userRes.rows[0].id, `FAC-${facCounter.toString().padStart(3, '0')}`, firstName, lastName, fac.dept, 'Assistant Professor']
        );
        facCounter++;
      }
    }

    // 5. Students
    console.log('Creating Students...');
    const shuffledStudents = shuffleArray(STUDENTS_DATA);
    let studentIdsList = [];
    
    // Assign Hostellers/Day Scholars
    // 35 hostellers, 15 day scholars
    const hostellers = shuffledStudents.slice(0, 35);
    const dayScholars = shuffledStudents.slice(35, 50);

    let stuCounter = 1;
    for (const dept of DEPARTMENTS) {
      // Get 10 students for this department
      const deptStudents = shuffledStudents.slice((DEPARTMENTS.indexOf(dept)*10), (DEPARTMENTS.indexOf(dept)*10)+10);
      
      for (const stuName of deptStudents) {
        const userRes = await pool.query(
          "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'student') RETURNING id",
          [`student${stuCounter}@nexcampus.demo`, defaultPassword]
        );
        const [firstName, ...lastNameParts] = stuName.split(' ');
        const lastName = lastNameParts.join(' ');
        
        const isHosteller = hostellers.includes(stuName);
        
        const stuRes = await pool.query(
          `INSERT INTO students 
          (user_id, student_id, roll_number, first_name, last_name, phone, department, course, semester, section, admission_year, dob, batch, hostel_status, hostel_block, room_number) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
          [
            userRes.rows[0].id,
            `STU-${stuCounter.toString().padStart(3, '0')}`,
            `24${dept.code}${stuCounter.toString().padStart(3, '0')}`,
            firstName,
            lastName,
            '9876543210',
            dept.name,
            'B.Tech',
            3,
            'A',
            2023,
            '2004-05-15',
            '2027',
            isHosteller ? 'hosteller' : 'day_scholar',
            isHosteller ? 'Block A' : null,
            isHosteller ? `A-${Math.floor(Math.random()*100)+100}` : null
          ]
        );
        studentIdsList.push(stuRes.rows[0].id);
        stuCounter++;
      }
    }

    // 6. Realistic Notices
    console.log('Creating Realistic Notices...');
    const notices = [
      { t: 'Internal Examination Schedule - Mid Semester', d: 'The mid-semester internal examinations will commence from the 15th of next month. All students are advised to check the detailed timetable published on the notice board and dashboard.', c: 'Exam', p: 'high', a: 'students' },
      { t: 'Library Timings Extended During Exams', d: 'To support students during the upcoming examination period, the central library timings have been extended to 11:00 PM on all working days and 8:00 PM on weekends.', c: 'Academic', p: 'normal', a: 'everyone' },
      { t: 'Tuition Fee Payment Deadline', d: 'This is a gentle reminder that the deadline for paying the current semester tuition fees is approaching. Please complete your payment by the end of this week to avoid late fines.', c: 'Administrative', p: 'high', a: 'students' },
      { t: 'Campus Wi-Fi Maintenance', d: 'The IT department will be conducting scheduled maintenance on the campus Wi-Fi infrastructure this Saturday between 10:00 AM and 2:00 PM. Expect intermittent connectivity issues during this window.', c: 'Administrative', p: 'normal', a: 'everyone' },
      { t: 'Upcoming Tech Symposium - Call for Papers', d: 'The annual Tech Symposium is scheduled for next month. Students and faculty are invited to submit their research papers and project proposals before the 20th.', c: 'Event', p: 'normal', a: 'everyone' }
    ];
    for (const n of notices) {
      await pool.query(
        "INSERT INTO notices (title, description, category, priority, target_audience, created_by) VALUES ($1, $2, $3, $4, $5, $6)",
        [n.t, n.d, n.c, n.p, n.a, adminUser.rows[0].id]
      );
    }

    // 7. Realistic Leave Requests
    console.log('Creating Realistic Leave Requests...');
    const leaveReasons = ['Fever and severe headache', 'Medical appointment with dentist', 'Urgent family function in hometown', 'Attending brother\'s wedding', 'Personal emergency at home'];
    for(let i=0; i<5; i++) {
      await pool.query(
        "INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason, status) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          studentIdsList[i],
          'Sick Leave',
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 86400000*2).toISOString().split('T')[0],
          leaveReasons[i],
          'pending'
        ]
      );
    }

    // 8. Realistic Gate Pass Requests
    console.log('Creating Realistic Gate Pass Requests...');
    const gateReasons = ['Visiting home for the weekend', 'Medical appointment at city hospital', 'Collecting essential documents from courier office', 'Handling urgent family matters', 'Buying study materials and laptop repair'];
    for(let i=5; i<10; i++) {
      await pool.query(
        "INSERT INTO gate_pass_requests (student_id, date, time, destination, reason, is_emergency, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          studentIdsList[i],
          new Date().toISOString().split('T')[0],
          '14:00:00',
          'City Center',
          gateReasons[i-5],
          false,
          'pending'
        ]
      );
    }

    // 9. Realistic Complaints
    console.log('Creating Realistic Complaints...');
    const complaints = [
      { cat: 'Electrical', desc: 'Ceiling fan in room 214 is making a loud noise and needs repair.' },
      { cat: 'Plumbing', desc: 'Water leakage from the washbasin tap in the 3rd floor washroom.' },
      { cat: 'Internet', desc: 'Wi-Fi router on the 2nd floor of Block A is frequently disconnecting.' },
      { cat: 'Cleaning', desc: 'Corridor area needs deep cleaning as dust has accumulated.' },
      { cat: 'Mess', desc: 'The quality of rice served during lunch yesterday was very poor.' }
    ];
    for (let i = 0; i < 5; i++) {
      if (complaints[i].cat === 'Mess') {
        await pool.query(
          "INSERT INTO mess_complaints (student_id, description, status) VALUES ($1, $2, $3)",
          [studentIdsList[i], complaints[i].desc, 'submitted']
        );
      } else {
        await pool.query(
          "INSERT INTO hostel_complaints (student_id, category, room_number, description, priority, status) VALUES ($1, $2, $3, $4, $5, $6)",
          [studentIdsList[i], complaints[i].cat, `Room ${100+i}`, complaints[i].desc, 'normal', 'submitted']
        );
      }
    }

    // 10. Certificates (if table exists)
    console.log('Creating Realistic Certificate Requests...');
    try {
      const certTypes = ['Bonafide Certificate', 'Character Certificate', 'Study Certificate', 'Course Completion Certificate'];
      const purposes = ['Opening a bank account', 'Applying for a passport', 'Higher studies application', 'Internship application'];
      
      for(let i=0; i<4; i++) {
        await pool.query(
          "INSERT INTO certificates (student_id, certificate_type, purpose, status) VALUES ($1, $2, $3, $4)",
          [studentIdsList[i], certTypes[i], purposes[i], 'pending']
        );
      }
    } catch(e) {
      console.log('Certificates table might not have purpose column or might not exist yet.');
    }

    console.log('Custom Seed Completed Successfully!');
  } catch(error) {
    console.error('Custom Seed Failed:', error);
  } finally {
    await pool.end();
  }
}

run();
