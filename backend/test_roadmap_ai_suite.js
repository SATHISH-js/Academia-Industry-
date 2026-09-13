const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Advanced Roadmap, AI Interview & Security Test Suite ---');
  let failures = 0;

  // 1. Student Login
  console.log('\n[1] Authenticating as Student...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student@example.com', password: 'Password123!' });

  const token = loginRes.data?.data?.token;
  if (token) {
    console.log('✔ Authenticated. Token acquired.');
  } else {
    console.error('✖ Login failed');
    failures++;
  }

  // 2. Roadmaps List
  console.log('\n[2] Fetching Career Paths & Company Roadmaps (GET /api/roadmaps)...');
  const roadmapsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/roadmaps',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (roadmapsRes.status === 200 && roadmapsRes.data.data.length >= 5) {
    console.log(`✔ Found ${roadmapsRes.data.data.length} roadmaps across Career Paths and Company Tracks.`);
  } else {
    console.error('✖ Failed to fetch roadmaps:', roadmapsRes);
    failures++;
  }

  // 3. Google Track Detail & Company Match %
  console.log('\n[3] Testing Google SWE Track & Company Skill Match % (GET /api/roadmaps/4)...');
  const googleTrack = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/roadmaps/4',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (googleTrack.status === 200 && googleTrack.data.data.companyMatch) {
    const cm = googleTrack.data.data.companyMatch;
    console.log(`✔ Google Track retrieved. Target Role: ${cm.targetRole}, Company Match Score: ${cm.score}%. Matched: ${cm.matchedSkills.length}, Gaps: ${cm.skillGaps.length}`);
  } else {
    console.error('✖ Failed to fetch Google track:', googleTrack);
    failures++;
  }

  // 4. Toggle Task
  console.log('\n[4] Testing Interactive Task Toggle (POST /api/roadmaps/1/tasks/3/toggle)...');
  const toggleRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/roadmaps/1/tasks/3/toggle',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });

  if (toggleRes.status === 200 && toggleRes.data.success) {
    console.log(`✔ Task toggled successfully! New status: is_completed=${toggleRes.data.data.is_completed}`);
  } else {
    console.error('✖ Failed to toggle task:', toggleRes);
    failures++;
  }

  // 5. Mock Interview Submission & NLP Analysis
  console.log('\n[5] Testing AI Mock Interview NLP Analysis (POST /api/mock-interview/submit)...');
  const interviewPayload = {
    role_title: 'Full Stack Software Engineer',
    company_name: 'TechCorp Solutions',
    answers: [
      {
        question_id: 1,
        question: 'How do you handle state management across deeply nested components in a modern React application?',
        user_response: 'In our application we utilize React Context API with useReducer for lightweight global state like authentication and user preferences. For high-frequency state updates we avoid unnecessary re-renders by isolating state to leaf components and using useMemo and useCallback hooks.'
      },
      {
        question_id: 2,
        question: 'Explain how database indexing works in relational databases and what tradeoffs are involved.',
        user_response: 'Database indexes are organized as balanced B-Tree structures. When a query filters by an indexed column, MySQL executes a logarithmic search rather than an expensive full table scan. The primary tradeoff is write overhead and disk storage, because INSERT, UPDATE, and DELETE queries must update the index tree.'
      }
    ]
  };

  const interviewRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/mock-interview/submit',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, interviewPayload);

  if (interviewRes.status === 201 && interviewRes.data.success) {
    const report = interviewRes.data.data;
    console.log(`✔ AI Interview Report generated!`);
    console.log(`   Overall Score: ${report.overallScore}% | Technical: ${report.technicalScore}% | Confidence: ${report.confidenceScore}% | Communication: ${report.communicationScore}%`);
    console.log(`   Words Analyzed: ${report.totalWordsAnalyzed}, Filler Words: ${report.fillerWordsDetected}`);
  } else {
    console.error('✖ Failed to evaluate mock interview:', interviewRes);
    failures++;
  }

  // 6. Resume Data Assembly with Educational Qualifications
  console.log('\n[6] Testing Resume Data Assembly (GET /api/resume/data)...');
  const resumeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume/data',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (resumeRes.status === 200 && resumeRes.data.data.education.length >= 3) {
    const ed = resumeRes.data.data.education;
    console.log(`✔ Resume assembled! Included 10th (${ed[2].score}), 12th (${ed[1].score}), and UG (${ed[0].score}) qualifications.`);
  } else {
    console.error('✖ Failed to fetch resume data:', resumeRes);
    failures++;
  }

  // 7. Activity History Log
  console.log('\n[7] Testing In-App Activity History (GET /api/activity/history)...');
  const actRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/activity/history',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (actRes.status === 200 && actRes.data.data.length > 0) {
    console.log(`✔ Activity history retrieved: ${actRes.data.data.length} logged events found.`);
  } else {
    console.error('✖ Failed to fetch activity history:', actRes);
    failures++;
  }

  // 8. Login Audit Trail
  console.log('\n[8] Testing Login Security Audit Trail (GET /api/auth/login-history)...');
  const loginAuditRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login-history',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (loginAuditRes.status === 200 && loginAuditRes.data.data.length > 0) {
    console.log(`✔ Login audit records retrieved: ${loginAuditRes.data.data.length} sessions recorded.`);
  } else {
    console.error('✖ Failed to fetch login history:', loginAuditRes);
    failures++;
  }

  console.log(`\n===================================`);
  console.log(`Suite Summary: ${failures === 0 ? 'ALL ADVANCED TESTS PASSED ✔' : `${failures} TESTS FAILED ✖`}`);
  console.log(`===================================`);

  process.exit(failures === 0 ? 0 : 1);
}

runTests();
