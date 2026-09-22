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
    if (stuData.data.length === 0) throw new Error('No students enrolled in this institution.');
    const sampleStudent = stuData.data[0];
    console.log(`   Sample Student: ${sampleStudent.name} (${sampleStudent.department}) - Reg: ${sampleStudent.enrollment_number} - CGPA: ${sampleStudent.cgpa}`);

    // 5. Student In-App Activity Timeline Monitoring
    console.log(`\n[5] Monitoring Student In-App Activity History (GET /api/institution/students/${sampleStudent.id}/activity)...`);
    const actRes = await fetch(`${BASE_URL}/institution/students/${sampleStudent.id}/activity`, { headers: authHeaders });
    const actData = await actRes.json();
    if (!actData.success) throw new Error('Activity monitoring failed: ' + JSON.stringify(actData));
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
    console.log(`✔ Discovered ${collabData.data.totalFound} industry collaboration opportunity/initiatives.`);

    // 10. Direct Access Student by Register Number
    console.log(`\n[10] Testing Direct Access by Register Number (GET /api/institution/students/by-reg-number/${sampleStudent.enrollment_number})...`);
    const regRes = await fetch(`${BASE_URL}/institution/students/by-reg-number/${sampleStudent.enrollment_number}`, { headers: authHeaders });
    const regData = await regRes.json();
    if (!regData.success) throw new Error('Register number lookup failed: ' + JSON.stringify(regData));
    console.log(`✔ Found student: ${regData.data.name} (Reg No: ${regData.data.enrollment_number}) - Dept: ${regData.data.department}`);

    // 11. Department-wise Student Visibility
    const sampleDept = sampleStudent.department || 'Computer Science & Engineering';
    console.log(`\n[11] Testing Department-wise Student Visibility (GET /api/institution/students?department=${encodeURIComponent(sampleDept)})...`);
    const deptRes = await fetch(`${BASE_URL}/institution/students?department=${encodeURIComponent(sampleDept)}`, { headers: authHeaders });
    const deptData = await deptRes.json();
    console.log(`✔ Found ${deptData.data.length} student(s) in ${sampleDept} department.`);

    // 12. Institutional Regular Activities Stream
    console.log('\n[12] Fetching Institutional Regular Activity Stream (GET /api/institution/activities)...');
    const actStreamRes = await fetch(`${BASE_URL}/institution/activities`, { headers: authHeaders });
    const actStreamData = await actStreamRes.json();
    console.log(`✔ Retrieved ${actStreamData.data.length} live regular activities for institution.`);
    if (actStreamData.data.length > 0) {
      console.log(`   Latest Activity: [${actStreamData.data[0].action_type}] ${actStreamData.data[0].title} by ${actStreamData.data[0].user_name}`);
    }

    // 13. Contact Student
    console.log('\n[13] Contacting Student via In-App Message (POST /api/institution/contact/student)...');
    const contactStuRes = await fetch(`${BASE_URL}/institution/contact/student`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        student_id: sampleStudent.id,
        subject: 'Institutional Academic Review & Career Mentoring',
        message: `Dear ${sampleStudent.name}, your semester skill assessment results have been reviewed by the department.`,
        contact_type: 'ACADEMIC_NOTICE'
      })
    });
    const contactStuData = await contactStuRes.json();
    if (!contactStuData.success) throw new Error('Contact student failed: ' + JSON.stringify(contactStuData));
    console.log(`✔ Student contacted successfully! Message ID: ${contactStuData.data.message_id}`);

    // 14. Contact Academician
    const sampleAcad = acadData.data.academicians[0];
    console.log('\n[14] Contacting Academician via In-App Message (POST /api/institution/contact/academician)...');
    const contactAcadRes = await fetch(`${BASE_URL}/institution/contact/academician`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        academician_id: sampleAcad.id,
        subject: 'Department Curriculum Alignment & Research MoU Review',
        message: `Dear ${sampleAcad.name}, please join the upcoming institutional council meeting.`,
        contact_type: 'FACULTY_MEETING'
      })
    });
    const contactAcadData = await contactAcadRes.json();
    if (!contactAcadData.success) throw new Error('Contact academician failed: ' + JSON.stringify(contactAcadData));
    console.log(`✔ Academician contacted successfully! Message ID: ${contactAcadData.data.message_id}`);

    // 15. View Sent Messages
    console.log('\n[15] Fetching Sent Outreach Messages (GET /api/institution/messages)...');
    const msgListRes = await fetch(`${BASE_URL}/institution/messages`, { headers: authHeaders });
    const msgListData = await msgListRes.json();
    console.log(`✔ Retrieved ${msgListData.data.length} sent outreach message(s).`);

    // 16. Add Academician by Register / Employee Number
    const uniqueId = Date.now().toString().slice(-4);
    console.log('\n[16] Adding Academician by Register Number (POST /api/institution/academicians)...');
    const addAcadRes = await fetch(`${BASE_URL}/institution/academicians`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        employee_id: `FAC-IT-${uniqueId}`,
        name: `Dr. Meera Nambiar ${uniqueId}`,
        email: `meera.faculty.${uniqueId}@example.com`,
        department: 'Information Technology',
        designation: 'Associate Professor',
        qualification: 'Ph.D in Distributed Computing',
        experience_years: 11,
        specialization: 'Cloud Computing, Microservices'
      })
    });
    const addAcadData = await addAcadRes.json();
    if (!addAcadData.success) throw new Error('Add academician failed: ' + JSON.stringify(addAcadData));
    console.log(`✔ Academician added successfully: ${addAcadData.data.name} (Employee ID: ${addAcadData.data.employee_id})`);

    console.log('\n=============================================================');
    console.log('✔ ALL 16 INSTITUTION PORTAL BACKEND TESTS PASSED SUCCESSFULLY');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
