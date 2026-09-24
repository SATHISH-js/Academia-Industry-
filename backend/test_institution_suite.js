const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Institution Portal & MoU Linkage Test Suite ---\n');

  try {
    // 1. Test Public Institution Listing
    console.log('[1] Fetching Public Institutions List (GET /api/institution/public-list)...');
    const pubRes = await fetch(`${BASE_URL}/institution/public-list`);
    const pubData = await pubRes.json();
    console.log(`✔ Retrieved ${pubData.data.length} registered academic institutions.`);

    // 2. Authenticate as Institution
    console.log('\n[2] Authenticating as Institution Admin...');
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
    const token = loginData.data.token;
    console.log('✔ Authenticated. Token acquired for:', loginData.data.user.email);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 3. Institution Analytics
    console.log('\n[3] Fetching Institution Analytics (GET /api/institution/analytics)...');
    const analyticsRes = await fetch(`${BASE_URL}/institution/analytics`, { headers: authHeaders });
    const analyticsData = await analyticsRes.json();
    console.log(`✔ Analytics: ${analyticsData.data.totalStudents} Students, ${analyticsData.data.totalFaculty} Faculty, ${analyticsData.data.activePartners} Active MoUs`);

    // 4. Student Directory for College
    console.log('\n[4] Fetching Enrolled Students Directory (GET /api/institution/students)...');
    const stuRes = await fetch(`${BASE_URL}/institution/students`, { headers: authHeaders });
    const stuData = await stuRes.json();
    console.log(`✔ Found ${stuData.data.length} student(s) enrolled in this institution.`);
    if (stuData.data.length > 0) {
      console.log(`   Sample Student: ${stuData.data[0].name} (${stuData.data[0].department}) - CGPA: ${stuData.data[0].cgpa}`);
    }

    // 5. Student In-App Activity Timeline Monitoring
    console.log('\n[5] Monitoring Student In-App Activity History (GET /api/institution/students/1/activity)...');
    const actRes = await fetch(`${BASE_URL}/institution/students/1/activity`, { headers: authHeaders });
    const actData = await actRes.json();
    console.log(`✔ Retrieved activity timeline for: ${actData.data.student.name}`);
    console.log(`   Logged In-App Activities: ${actData.data.activities.length}`);
    console.log(`   Mock Interviews Done: ${actData.data.mockInterviews.length}`);
    console.log(`   Verified Skills: ${actData.data.verifiedSkills.map(s => s.skill_name).join(', ')}`);

    // 6. Faculty Academician Directory
    console.log('\n[6] Fetching Faculty Academician Directory (GET /api/institution/academicians)...');
    const acadRes = await fetch(`${BASE_URL}/institution/academicians`, { headers: authHeaders });
    const acadData = await acadRes.json();
    console.log(`✔ Found ${acadData.data.totalAcademicians} faculty member(s) affiliated with institution.`);
    if (acadData.data.academicians.length > 0) {
      console.log(`   Sample Faculty: ${acadData.data.academicians[0].name} - ${acadData.data.academicians[0].designation} (${acadData.data.academicians[0].department})`);
    }

    // 7. Active Industry Partners & MoUs
    console.log('\n[7] Fetching Industry Partners & MoUs (GET /api/institution/partners)...');
    const partnerRes = await fetch(`${BASE_URL}/institution/partners`, { headers: authHeaders });
    const partnerData = await partnerRes.json();
    console.log(`✔ Found ${partnerData.data.connections.length} active/pending MoU(s).`);

    // 8. Proposing a New MoU
    console.log('\n[8] Proposing MoU Partnership to Industry Company (POST /api/institution/mou/propose)...');
    const mouRes = await fetch(`${BASE_URL}/institution/mou/propose`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        industry_id: 1,
        partnership_type: 'LAB_COLLABORATION',
        valid_until: '2027-12-31',
        notes: 'Establishment of Advanced Center of Excellence in Cloud Computing and Full-Stack Engineering.',
        proposal_note: 'Bilateral agreement for student internships, faculty sabbaticals, and sponsored research.'
      })
    });
    const mouData = await mouRes.json();
    if (!mouData.success) throw new Error('MoU proposal failed: ' + JSON.stringify(mouData));
    console.log(`✔ MoU proposed successfully! Connection ID: ${mouData.data.connectionId}`);

    // 9. Search Industry Collaborations
    console.log('\n[9] Searching Industry Collaborations (GET /api/institution/collaborations/search)...');
    const collabRes = await fetch(`${BASE_URL}/institution/collaborations/search`, { headers: authHeaders });
    const collabData = await collabRes.json();
    console.log(`✔ Discovered ${collabData.data.totalFound} industry collaboration opportunity/initiatives across Research, Hackathons, and Workshops.`);

    console.log('\n=============================================================');
    console.log('✔ ALL INSTITUTION PORTAL BACKEND TESTS PASSED SUCCESSFULLY');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
