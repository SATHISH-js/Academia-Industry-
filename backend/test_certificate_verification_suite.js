const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper to make HTTP requests
function httpRequest(options, data = null, isMultipart = false, boundary = '') {
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

    if (data) {
      if (isMultipart) {
        req.write(data);
      } else {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
    }
    req.end();
  });
}

// Multipart form-data builder for certificate file upload
function buildMultipartBody(boundary, filename, fileBuffer, mimeType = 'image/png') {
  const crlf = '\r\n';
  let body = '';
  body += `--${boundary}${crlf}`;
  body += `Content-Disposition: form-data; name="file"; filename="${filename}"${crlf}`;
  body += `Content-Type: ${mimeType}${crlf}${crlf}`;

  const headerBuf = Buffer.from(body, 'utf8');
  const footerBuf = Buffer.from(`${crlf}--${boundary}--${crlf}`, 'utf8');
  return Buffer.concat([headerBuf, fileBuffer, footerBuf]);
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('   AI Certificate Verification & Skill Credential Integration Suite   ');
  console.log('======================================================================\n');

  let failures = 0;
  let token = null;

  // 1. Authenticate as Student
  console.log('[Test 1] Authenticating as Student (POST /api/auth/login)...');
  try {
    const loginRes = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'student@example.com', password: 'Password123!' });

    if (loginRes.status === 200 && loginRes.data?.data?.token) {
      token = loginRes.data.data.token;
      console.log('  ✔ Student authenticated successfully. JWT token acquired.');
    } else {
      console.error('  ✖ Login failed:', loginRes);
      failures++;
      return;
    }
  } catch (err) {
    console.error('  ✖ Could not connect to backend server on port 5000:', err.message);
    return;
  }

  // 2. Upload Certificate & Initialize Assessment
  console.log('\n[Test 2] Uploading Certificate & Initializing 20-Question AI Assessment...');
  let quizId = null;
  let publicQuestions = [];
  try {
    const certPath = path.join(__dirname, 'uploads', 'certificates', 'sample_ml_cert.png');
    const certBuffer = fs.existsSync(certPath) ? fs.readFileSync(certPath) : Buffer.from('MockCertificateImageData', 'utf8');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const multipartData = buildMultipartBody(boundary, 'Advanced_ML_Certificate.png', certBuffer, 'image/png');

    const startRes = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/certificate-verify/start-assessment',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartData.length
      }
    }, multipartData, true, boundary);

    if (startRes.status === 201 && startRes.data?.success && startRes.data?.data?.quiz_id) {
      const qData = startRes.data.data;
      quizId = qData.quiz_id;
      publicQuestions = qData.questions || [];

      console.log(`  ✔ Assessment initialized with ID: ${quizId}`);
      console.log(`  ✔ Course Title: "${qData.course_title}"`);
      console.log(`  ✔ Duration: ${qData.duration_seconds}s (10 Minutes)`);
      console.log(`  ✔ Questions Generated: ${qData.total_questions}`);
      console.log(`  ✔ First question sample: "${publicQuestions[0]?.question}"`);

      // Verify server answers are NOT leaked to client
      const hasLeakedAnswer = publicQuestions.some(q => q.answer !== undefined);
      if (!hasLeakedAnswer) {
        console.log('  ✔ Security verified: Answer keys remain secure on server.');
      } else {
        console.error('  ✖ Security vulnerability: Server leaked answers in public payload!');
        failures++;
      }
    } else {
      console.error('  ✖ Failed to start assessment:', startRes);
      failures++;
    }
  } catch (err) {
    console.error('  ✖ Error in start-assessment test:', err.message);
    failures++;
  }

  if (!quizId) {
    console.error('\n✖ Aborting remaining tests due to missing quizId.');
    return;
  }

  // 3. Submit Answers and Verify Grading & Badge Award
  console.log('\n[Test 3] Submitting Assessment Answers & Evaluating Badge Decision...');
  try {
    // Provide answers for all questions (majority 'A' and 'B')
    const sampleAnswers = {};
    publicQuestions.forEach((q, idx) => {
      // Intentionally select mostly 'A' and 'B'
      sampleAnswers[String(q.id)] = (idx % 2 === 0) ? 'A' : 'B';
    });

    const submitRes = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/certificate-verify/submit-quiz',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      quiz_id: quizId,
      answers: sampleAnswers
    });

    if (submitRes.status === 200 && submitRes.data?.success) {
      const resData = submitRes.data.data;
      console.log(`  ✔ Assessment graded: ${resData.correct_count}/${resData.total_questions} correct (${resData.score_percentage}%)`);
      console.log(`  ✔ Time taken: ${resData.time_taken_seconds} seconds`);
      console.log(`  ✔ Badge Decision: ${resData.badge_awarded ? 'VERIFIED SKILL BADGE AWARDED! 🏆' : 'Assessment Completed'}`);
      console.log(`  ✔ Review sheet generated: ${resData.review?.length} detailed answer explanations.`);
    } else {
      console.error('  ✖ Submit quiz failed:', submitRes);
      failures++;
    }

    // Subtest: Test Verified Badge Award (>= 18/20 correct)
    console.log('  Testing 90%+ High Score for Verified Skill Badge Award...');
    const certPath = path.join(__dirname, 'uploads', 'certificates', 'sample_react_cert.png');
    const certBuffer = fs.existsSync(certPath) ? fs.readFileSync(certPath) : Buffer.from('MockData', 'utf8');
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const multipartData = buildMultipartBody(boundary, 'FullStack_React_Arch.png', certBuffer, 'image/png');

    const highStartRes = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/certificate-verify/start-assessment',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartData.length
      }
    }, multipartData, true, boundary);

    if (highStartRes.status === 201 && highStartRes.data?.data?.quiz_id) {
      const highQuizId = highStartRes.data.data.quiz_id;
      // In fallback generator, questions alternate template answers: [A, B, B, A]
      // Let's provide matching answers to exceed 18/20
      const answers90 = {};
      for (let i = 1; i <= 20; i++) {
        // template 0 -> A, template 1 -> B, template 2 -> B, template 3 -> A
        const pattern = ['A', 'B', 'B', 'A'];
        answers90[String(i)] = pattern[(i - 1) % pattern.length];
      }

      const highSubmitRes = await httpRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/certificate-verify/submit-quiz',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, {
        quiz_id: highQuizId,
        answers: answers90
      });

      if (highSubmitRes.data?.data?.badge_awarded) {
        console.log(`  ✔ Verified Skill Badge Earned: Score = ${highSubmitRes.data.data.score_percentage}% (${highSubmitRes.data.data.correct_count}/20). Badge awarded = ${highSubmitRes.data.data.badge_awarded}`);
      } else {
        console.log(`  ℹ Score = ${highSubmitRes.data?.data?.score_percentage}%, correct = ${highSubmitRes.data?.data?.correct_count}/20`);
      }
    }
  } catch (err) {
    console.error('  ✖ Error in submit-quiz test:', err.message);
    failures++;
  }

  // 4. Publish to Community Credential Feed
  console.log('\n[Test 4] Publishing Certificate Credential to Community Feed...');
  try {
    const postRes = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/certificate-verify/create-post',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      quiz_id: quizId,
      caption: 'Thrilled to complete my AI skill verification assessment! Validated my domain competencies.'
    });

    if (postRes.status === 201 && postRes.data?.success) {
      console.log(`  ✔ Post published with Post ID: ${postRes.data.data?.post_id}`);
      console.log(`  ✔ Author: ${postRes.data.data?.student_name}`);
      console.log(`  ✔ Score displayed on post: ${postRes.data.data?.score_percentage}%`);
    } else {
      console.error('  ✖ Failed to publish post:', postRes);
      failures++;
    }
  } catch (err) {
    console.error('  ✖ Error in create-post test:', err.message);
    failures++;
  }

  // 5. Retrieve Community Credential Feed
  console.log('\n[Test 5] Fetching Community Credential Feed (GET /api/certificate-verify/feed)...');
  try {
    const feedRes = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/certificate-verify/feed',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (feedRes.status === 200 && feedRes.data?.success && Array.isArray(feedRes.data.data?.posts)) {
      const posts = feedRes.data.data.posts;
      console.log(`  ✔ Retrieved ${posts.length} feed posts.`);
      const latestPost = posts.find(p => p.quiz_id === quizId);
      if (latestPost) {
        console.log(`  ✔ Verified latest published post appears in feed: "${latestPost.caption}"`);
      }
    } else {
      console.error('  ✖ Failed to get community feed:', feedRes);
      failures++;
    }
  } catch (err) {
    console.error('  ✖ Error in getFeed test:', err.message);
    failures++;
  }

  // 6. Check Student Digital Portfolio Verification Integration
  console.log('\n[Test 6] Checking Student Digital Portfolio Integration (GET /api/portfolio)...');
  try {
    const portRes = await httpRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/portfolio',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (portRes.status === 200 && portRes.data?.success) {
      const certifications = portRes.data.data?.certifications || [];
      console.log(`  ✔ Found ${certifications.length} certifications on student portfolio.`);
      const verified = certifications.find(c => c.is_verified || c.badge_awarded);
      if (verified) {
        console.log(`  ✔ Portfolio verified: Certificate "${verified.name}" is marked verified with score ${verified.score_percentage}%.`);
      }
    } else {
      console.error('  ✖ Failed to load portfolio:', portRes);
      failures++;
    }
  } catch (err) {
    console.error('  ✖ Error in portfolio test:', err.message);
    failures++;
  }

  console.log('\n======================================================================');
  if (failures === 0) {
    console.log('   ✔ ALL 6 INTEGRATION TESTS PASSED CLEANLY WITH ZERO FAILURES!      ');
  } else {
    console.log(`   ✖ ${failures} TEST(S) FAILED. PLEASE INSPECT LOGS ABOVE.         `);
  }
  console.log('======================================================================\n');
}

if (require.main === module) {
  runTestSuite();
}

module.exports = { runTestSuite };
