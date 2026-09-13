const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Industry Portal Enhancements Test Suite ---\n');

  try {
    // 1. Authenticate as Industry Recruiter
    console.log('[1] Authenticating as Industry Recruiter...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'industry@example.com',
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

    // 2. Test Candidate Search & Role Match Score Filter
    console.log('\n[2] Testing Candidate Search & Role Matching (GET /api/industry/candidates/search?minScore=50)...');
    const searchRes = await fetch(`${BASE_URL}/industry/candidates/search?minScore=50`, {
      headers: authHeaders
    });
    const searchData = await searchRes.json();
    console.log(`✔ Found ${searchData.data.totalMatches} candidate(s) meeting match score threshold >= 50%`);
    if (searchData.data.candidates.length > 0) {
      const top = searchData.data.candidates[0];
      console.log(`   Top Candidate: ${top.name} (${top.department}) - Score: ${top.matchScore}%`);
      console.log(`   Matched Skills: ${top.matchedSkills.map(s => s.skill_name).join(', ')}`);
    }

    // 3. Test Opportunity-specific matching
    console.log('\n[3] Testing Opportunity-Specific Sourcing (GET /api/industry/candidates/search?opportunityType=INTERNSHIP&opportunityId=1)...');
    const oppSearchRes = await fetch(`${BASE_URL}/industry/candidates/search?opportunityType=INTERNSHIP&opportunityId=1`, {
      headers: authHeaders
    });
    const oppSearchData = await oppSearchRes.json();
    console.log(`✔ Sourced ${oppSearchData.data.totalMatches} candidate(s) for Opportunity #1.`);

    // 4. Test In-App Student Outreach (POST /api/industry/messages/send)
    console.log('\n[4] Testing Direct In-App Outreach Message (POST /api/industry/messages/send)...');
    const msgRes = await fetch(`${BASE_URL}/industry/messages/send`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        student_id: 1,
        opportunity_type: 'INTERNSHIP',
        opportunity_id: 1,
        subject: 'Interview Invitation: Cloud Full-Stack Trainee',
        message: 'Hello! Your verified Python and SQL proficiencies stood out to our hiring team. We would like to schedule an introductory technical interview.',
        message_type: 'INTERVIEW_INVITE'
      })
    });
    const msgData = await msgRes.json();
    if (!msgData.success) throw new Error('Message send failed: ' + JSON.stringify(msgData));
    console.log(`✔ Message dispatched successfully! Message ID: ${msgData.data.message_id}`);

    // 5. Verify Outreach History (GET /api/industry/messages)
    console.log('\n[5] Fetching Outreach Message History (GET /api/industry/messages)...');
    const historyRes = await fetch(`${BASE_URL}/industry/messages`, {
      headers: authHeaders
    });
    const historyData = await historyRes.json();
    console.log(`✔ Found ${historyData.data.length} sent outreach message(s).`);

    // 6. Test Institution Directory for Placements (GET /api/industry/institutions)
    console.log('\n[6] Fetching Institutions Directory (GET /api/industry/institutions)...');
    const instRes = await fetch(`${BASE_URL}/industry/institutions`, {
      headers: authHeaders
    });
    const instData = await instRes.json();
    console.log(`✔ Found ${instData.data.length} registered academic institution(s).`);

    // 7. Request Placement Drive Partnership (POST /api/industry/placements/request)
    console.log('\n[7] Proposing Campus Placement Drive (POST /api/industry/placements/request)...');
    const placementRes = await fetch(`${BASE_URL}/industry/placements/request`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        institution_id: 1,
        title: 'TechCorp Annual Campus Placement Sprint 2026',
        target_batch: '2026 Graduating Batch',
        target_departments: 'Computer Science, IT, AI & Data Science',
        expected_hires: 12,
        salary_package: '12 - 18 LPA',
        proposed_date: '2026-11-20',
        proposal_details: 'Annual campus hiring drive for associate software engineers and cloud infrastructure analysts. Includes online coding challenge and panel interviews.'
      })
    });
    const placementData = await placementRes.json();
    if (!placementData.success) throw new Error('Placement request failed: ' + JSON.stringify(placementData));
    console.log(`✔ Placement drive proposal submitted! Request ID: ${placementData.data.request_id}`);

    // 8. Fetch Placement Requests (GET /api/industry/placements/my-requests)
    console.log('\n[8] Fetching Placement Requests (GET /api/industry/placements/my-requests)...');
    const myReqRes = await fetch(`${BASE_URL}/industry/placements/my-requests`, {
      headers: authHeaders
    });
    const myReqData = await myReqRes.json();
    console.log(`✔ Found ${myReqData.data.length} placement proposal(s).`);

    // 9. Fetch Posted Opportunities (GET /api/industry/my-opportunities)
    console.log('\n[9] Fetching Posted Opportunities (GET /api/industry/my-opportunities)...');
    const myOppRes = await fetch(`${BASE_URL}/industry/my-opportunities`, {
      headers: authHeaders
    });
    const myOppData = await myOppRes.json();
    console.log(`✔ Retrieved ${myOppData.data.totalOpportunities} active opportunity posting(s) (${myOppData.data.internships.length} Internships, ${myOppData.data.jobs.length} Jobs).`);

    console.log('\n======================================================');
    console.log('✔ ALL INDUSTRY PORTAL BACKEND TESTS PASSED SUCCESSFULLY');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
