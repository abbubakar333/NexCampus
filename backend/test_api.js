async function runSuite() {
  console.log('--- Testing API Endpoints via Real Login ---');

  // 1. Login as Admin
  const adminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nexcampus.demo', password: 'Demo@12345' })
  });
  const adminLogin = await adminLoginRes.json();
  const adminToken = adminLogin.token;

  // 2. Login as Student
  const studentLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student1@nexcampus.demo', password: 'Demo@12345' })
  });
  const studentLogin = await studentLoginRes.json();
  const studentToken = studentLogin.token;

  console.log(`Admin Authenticated: ${adminLogin.success}, Student Authenticated: ${studentLogin.success}`);

  const tests = [
    { name: 'Admin: Students', url: 'http://localhost:5000/api/students', token: adminToken },
    { name: 'Admin: Faculty', url: 'http://localhost:5000/api/faculty', token: adminToken },
    { name: 'Admin: Gate Passes', url: 'http://localhost:5000/api/gate-passes', token: adminToken },
    { name: 'Admin: Leaves', url: 'http://localhost:5000/api/leaves', token: adminToken },
    { name: 'Admin: Complaints (alias)', url: 'http://localhost:5000/api/complaints', token: adminToken },
    { name: 'Admin: General Complaints', url: 'http://localhost:5000/api/general-complaints', token: adminToken },
    { name: 'Admin: Hostel Complaints', url: 'http://localhost:5000/api/hostel', token: adminToken },
    { name: 'Admin: Notices', url: 'http://localhost:5000/api/notices', token: adminToken },
    { name: 'Admin: Fees', url: 'http://localhost:5000/api/fees', token: adminToken },
    { name: 'Admin: Certificates', url: 'http://localhost:5000/api/certificates', token: adminToken },
    { name: 'Admin: Settings', url: 'http://localhost:5000/api/settings', token: adminToken },
    { name: 'Admin: Mess Menu', url: 'http://localhost:5000/api/mess', token: adminToken },
    { name: 'Student: Me Profile', url: 'http://localhost:5000/api/auth/me', token: studentToken },
    { name: 'Student: Exams Upcoming', url: 'http://localhost:5000/api/examinations/upcoming', token: studentToken },
    { name: 'Student: My Fees', url: 'http://localhost:5000/api/fees/my', token: studentToken },
    { name: 'Student: Attendance', url: 'http://localhost:5000/api/attendance', token: studentToken },
    { name: 'Student: Hostel Details', url: 'http://localhost:5000/api/hostel', token: studentToken },
    { name: 'Student: Gate Passes', url: 'http://localhost:5000/api/gate-passes', token: studentToken },
    { name: 'Student: Leaves', url: 'http://localhost:5000/api/leaves', token: studentToken },
  ];

  let failed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(t.url, { headers: { Authorization: `Bearer ${t.token}` } });
      if (!res.ok) {
        console.error(`❌ FAIL [${res.status}]: ${t.name} (${t.url})`);
        failed++;
      } else {
        const json = await res.json();
        console.log(`✅ PASS: ${t.name}`);
      }
    } catch (e) {
      console.error(`❌ ERROR: ${t.name} - ${e.message}`);
      failed++;
    }
  }

  if (failed === 0) {
    console.log('\n🎉 ALL 19 API ENDPOINTS PASSED CLEANLY WITH ZERO ERRORS!');
  } else {
    console.error(`\n⚠️ ${failed} tests failed.`);
  }
}

runSuite();
