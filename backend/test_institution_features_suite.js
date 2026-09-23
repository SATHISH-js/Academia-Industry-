const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Institution Portal New Features Test Suite ---');
  let instToken = '';

  try {
    // 1. Authenticate as Institution Admin
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'institution@example.com',
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error('Login failed: ' + JSON.stringify(loginData));
    instToken = loginData.data.token;
    console.log('✔ [1] Authenticated as Institution Admin (institution@example.com)');

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${instToken}`
    };

    // 2. Add New Student under Institution
    const randomSuffix = Date.now().toString().slice(-4);
    const studentEmail = `kavya.patel${randomSuffix}@apex-tech.edu`;
    const studentPassword = 'KavyaPassword123!';

    const addStudentRes = await fetch(`${BASE_URL}/institution/students`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Kavya Patel',
        email: studentEmail,
        password: studentPassword,
        department: 'Artificial Intelligence & Data Science',
        degree: 'B.Tech',
        graduation_year: 2026,
        cgpa: 9.35,
        enrollment_number: `AIT-AIDS-${randomSuffix}`,
        phone: '+91 9876543299'
      })
    });
    const addStudentData = await addStudentRes.json();
    if (!addStudentData.success) throw new Error('Add student failed: ' + JSON.stringify(addStudentData));
    console.log(`✔ [2] Institution created Student account: ${addStudentData.data.name} (${studentEmail})`);

    // Verify Newly Created Student Can Immediately Log In
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: studentPassword
      })
    });
    const studentLoginData = await studentLoginRes.json();
    if (!studentLoginData.success || studentLoginData.data.user.role !== 'STUDENT') {
      throw new Error('Created student login failed: ' + JSON.stringify(studentLoginData));
    }
    console.log(`✔ [3] VERIFIED: Student immediately authenticated at /login with their new credentials (Role: ${studentLoginData.data.user.role})`);

    // 3. Add New Academician under Institution
    const facultyEmail = `prof.suresh${randomSuffix}@apex-tech.edu`;
    const facultyPassword = 'SureshPassword123!';

    const addFacultyRes = await fetch(`${BASE_URL}/institution/academicians`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Dr. Suresh Nair',
        email: facultyEmail,
        password: facultyPassword,
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        employee_id: `FAC-CSE-${randomSuffix}`,
        experience_years: 12,
        specialization: 'High Performance Computing & Cloud Architecture',
        qualification: 'Ph.D in Cloud Systems'
      })
    });
    const addFacultyData = await addFacultyRes.json();
    if (!addFacultyData.success) throw new Error('Add academician failed: ' + JSON.stringify(addFacultyData));
    console.log(`✔ [4] Institution created Academician account: ${addFacultyData.data.name} (${facultyEmail})`);

    // Verify Newly Created Academician Can Immediately Log In
    const facultyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: facultyEmail,
        password: facultyPassword
      })
    });
    const facultyLoginData = await facultyLoginRes.json();
    if (!facultyLoginData.success || facultyLoginData.data.user.role !== 'ACADEMICIAN') {
      throw new Error('Created faculty login failed: ' + JSON.stringify(facultyLoginData));
    }
    console.log(`✔ [5] VERIFIED: Academician immediately authenticated at /login with their new credentials (Role: ${facultyLoginData.data.user.role})`);

    // 4. Test Dynamic Departments
    const deptsRes = await fetch(`${BASE_URL}/institution/departments`, { headers: authHeaders });
    const deptsData = await deptsRes.json();
    console.log(`✔ [6] Fetched ${deptsData.data.length} current institution departments`);

    const newDeptName = `Robotics & Automation ${randomSuffix}`;
    const createDeptRes = await fetch(`${BASE_URL}/institution/departments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: newDeptName,
        code: `ROB-${randomSuffix}`,
        head_of_department: 'Dr. K. V. Raman'
      })
    });
    const createDeptData = await createDeptRes.json();
    if (!createDeptData.success) throw new Error('Create department failed: ' + JSON.stringify(createDeptData));
    console.log(`✔ [7] Created new department: '${createDeptData.data.name}' (Code: ${createDeptData.data.code})`);

    // 5. Test Industry Search Autocomplete
    const searchRes = await fetch(`${BASE_URL}/institution/industries-search?q=Tech`, { headers: authHeaders });
    const searchData = await searchRes.json();
    console.log(`✔ [8] Industry search returned ${searchData.data.length} matching enterprise(s): ${searchData.data.map(i => i.company_name).join(', ')}`);

    // 6. Test Industry Training Programs
    const trainingRes = await fetch(`${BASE_URL}/institution/training-programs`, { headers: authHeaders });
    const trainingData = await trainingRes.json();
    console.log(`✔ [9] Fetched ${trainingData.data.length} industry-provided training programs`);

    if (trainingData.data.length > 0) {
      const prog = trainingData.data[0];
      const enrollRes = await fetch(`${BASE_URL}/institution/training-programs/enroll`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          program_id: prog.id,
          requested_batch_size: 45,
          preferred_start_date: '2026-10-15',
          notes: 'Requesting on-campus kickoff with industry mentors.'
        })
      });
      const enrollData = await enrollRes.json();
      if (!enrollData.success) throw new Error('Enroll failed: ' + JSON.stringify(enrollData));
      console.log(`✔ [10] Requested training cohort for '${prog.title}' -> Enrollment ID: ${enrollData.data.enrollmentId}`);
    }

    // 7. Test Placement Field Visual Analytics
    const placementRes = await fetch(`${BASE_URL}/institution/placements/analytics`, { headers: authHeaders });
    const placementData = await placementRes.json();
    const pData = placementData.data;
    console.log(`✔ [11] Placement Field Analytics: Total Students = ${pData.totalStudents}, Placed = ${pData.placedStudents} (${pData.placementRate}%), Avg CTC = ${pData.averagePackage}`);
    console.log(`      Field Breakdown (${pData.fieldsData.length} fields):`);
    pData.fieldsData.forEach(f => {
      console.log(`      - ${f.field}: ${f.placedCount} placed (${f.percentage}%) | Avg CTC: ${f.avgCtc} LPA | Top: ${f.hiringCompanies.join(', ')}`);
    });

    console.log('\n=============================================================');
    console.log('✔ ALL INSTITUTION FEATURE BACKEND TESTS PASSED SUCCESSFULLY');
    console.log('=============================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Suite Error:', error.message);
    process.exit(1);
  }
}

runTests();
