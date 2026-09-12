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
  console.log('--- Starting API & RBAC Test Suite ---');
  let failures = 0;

  // 1. Test Student Login
  console.log('\n[1] Testing Student Login (student@example.com)...');
  const studentLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student@example.com', password: 'Password123!' });

  if (studentLogin.status === 200 && studentLogin.data.success && studentLogin.data.data.token) {
    console.log('✔ Student login successful! Token received.');
  } else {
    console.error('✖ Student login failed:', studentLogin);
    failures++;
  }
  const studentToken = studentLogin.data?.data?.token;

  // 2. Test Student Profile Endpoint with Token
  console.log('\n[2] Testing Student Profile Access (GET /api/students/profile)...');
  const stuProfile = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/students/profile',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });

  if (stuProfile.status === 200 && stuProfile.data.success && stuProfile.data.data.name === 'Aarav Sharma') {
    console.log('✔ Student profile retrieved:', stuProfile.data.data.name, '-', stuProfile.data.data.department);
  } else {
    console.error('✖ Failed to fetch student profile:', stuProfile);
    failures++;
  }

  // 3. Test RBAC Enforcement: Student attempting to access Institution Analytics
  console.log('\n[3] Testing RBAC: Student accessing Institution Analytics (Should be 403 Forbidden)...');
  const forbiddenAccess = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/institution/analytics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });

  if (forbiddenAccess.status === 403) {
    console.log('✔ RBAC correctly blocked student access with 403 Forbidden!');
  } else {
    console.error('✖ RBAC check failed! Expected 403, got:', forbiddenAccess.status);
    failures++;
  }

  // 4. Test Institution Login & Analytics Access
  console.log('\n[4] Testing Institution Login (institution@example.com)...');
  const instLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'institution@example.com', password: 'Password123!' });

  const instToken = instLogin.data?.data?.token;

  const instAnalytics = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/institution/analytics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${instToken}` }
  });

  if (instAnalytics.status === 200 && instAnalytics.data.success) {
    console.log('✔ Institution analytics retrieved:', JSON.stringify(instAnalytics.data.data));
  } else {
    console.error('✖ Failed to fetch institution analytics:', instAnalytics);
    failures++;
  }

  // 5. Test Internships with Dynamic Skill Match calculation
  console.log('\n[5] Testing Dynamic Skill Compatibility Match (GET /api/internships with Student Token)...');
  const internships = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/internships',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });

  if (internships.status === 200 && internships.data.data.length > 0) {
    const first = internships.data.data[0];
    console.log(`✔ Internships retrieved. Top internship "${first.title}" - Computed Match Score: ${first.matchScore}%`);
  } else {
    console.error('✖ Failed to retrieve internships:', internships);
    failures++;
  }

  console.log(`\n===================================`);
  console.log(`Test Suite Summary: ${failures === 0 ? 'ALL TESTS PASSED ✔' : `${failures} TESTS FAILED ✖`}`);
  console.log(`===================================`);

  process.exit(failures === 0 ? 0 : 1);
}

runTests();
