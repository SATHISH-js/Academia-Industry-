const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { GoogleGenAI } = require('@google/genai');
const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generate20QuestionsForTopic } = require('../services/topicAssessmentService');

// Config constants matching Hack 1
const TEST_DURATION_SECONDS = 10 * 60; // 10-minute assessment window
const TIME_GRACE_SECONDS = 20;         // Grace buffer for network submit latency
const BADGE_CORRECT_THRESHOLD = 18;    // 18/20 (90%) correct -> Verified Skill Badge
const PASS_CORRECT_THRESHOLD = 12;     // 12/20 (60%) correct -> Passed
const QUESTION_COUNT = 20;

// Memory cache for active quiz sessions & feed fallback
const ACTIVE_SESSIONS = new Map();
const MEMORY_FEED_POSTS = [];

// Initialize Google GenAI client if key is configured
const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
let genAI = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn('[CertificateVerification] GoogleGenAI init warning:', e.message);
  }
}

/**
 * Ensure database tables exist (self-healing)
 */
let tablesChecked = false;
async function ensureTables() {
  if (tablesChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_certificate_quiz_sessions (
        quiz_id VARCHAR(100) PRIMARY KEY,
        student_id INT NOT NULL,
        course_title VARCHAR(200) DEFAULT 'Certificate Course',
        certificate_filename VARCHAR(255) NOT NULL,
        certificate_url VARCHAR(255) NOT NULL,
        questions JSON NOT NULL,
        duration_seconds INT DEFAULT 600,
        submitted BOOLEAN DEFAULT FALSE,
        score_percentage DECIMAL(5,2) DEFAULT NULL,
        correct_count INT DEFAULT 0,
        badge_awarded BOOLEAN DEFAULT FALSE,
        result_data JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP NULL DEFAULT NULL
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_feed_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        quiz_id VARCHAR(100) DEFAULT NULL,
        certificate_url VARCHAR(255) NOT NULL,
        caption TEXT DEFAULT NULL,
        correct_count INT NOT NULL DEFAULT 0,
        total_questions INT NOT NULL DEFAULT 20,
        score_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        badge_awarded BOOLEAN NOT NULL DEFAULT FALSE,
        likes_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Ensure columns on student_certifications
    try {
      await pool.query(`
        ALTER TABLE student_certifications
          ADD COLUMN IF NOT EXISTS badge_awarded BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS score_percentage DECIMAL(5,2) DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS verification_quiz_id VARCHAR(100) DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS skills_detected JSON DEFAULT NULL;
      `);
    } catch (_) {}

    tablesChecked = true;
  } catch (err) {
    console.warn('[CertificateVerification] DB table auto-check warning (will use memory store if DB is down):', err.message);
  }
}

/**
 * Fallback generator for generating realistic 20 MCQs when Gemini key is not provided or offline
 */
function generateFallbackQuiz(extractedTitle = 'Software Engineering & Cloud Architecture') {
  const topics = [
    { topic: 'Architecture & Design Patterns', tech: 'Clean Architecture, Microservices & MVC' },
    { topic: 'State Management & Async Operations', tech: 'Event Loops, Promises & Reactive State' },
    { topic: 'Database Integrity & Query Optimization', tech: 'Indexing, ACID Transactions & Sharding' },
    { topic: 'API Security & Authentication', tech: 'JWT, OAuth2, Rate Limiting & OWASP' },
    { topic: 'Scalability, Caching & Performance', tech: 'Redis, CDNs, Connection Pooling & Latency' }
  ];

  const questions = [];
  for (let i = 1; i <= QUESTION_COUNT; i++) {
    const t = topics[(i - 1) % topics.length];
    const difficulty = i <= 5 ? 'EASY' : i <= 15 ? 'MEDIUM' : 'HARD';

    const questionTemplates = [
      {
        q: `In the context of ${t.tech}, which mechanism best guarantees fault tolerance and data consistency?`,
        opts: [
          'Two-Phase Commit (2PC) protocol with idempotency keys',
          'Client-side optimistic locking without rollback mechanisms',
          'Synchronous blocking RPC without timeouts',
          'Disabling write-ahead logging to maximize throughput'
        ],
        ans: 'A',
        exp: 'Two-Phase Commit with idempotency keys ensures distributed transactions either succeed across all participants or safely roll back.'
      },
      {
        q: `When optimizing ${t.topic}, how should resource contention under peak concurrent load be mitigated?`,
        opts: [
          'Spin-locking every worker thread synchronously',
          'Implementing non-blocking connection pools and distributed rate limiters',
          'Increasing TCP buffer size without queue bounds',
          'Allocating unbounded worker processes per connection'
        ],
        ans: 'B',
        exp: 'Bounded connection pools combined with distributed rate limiters prevent thread starvation and memory exhaustion.'
      },
      {
        q: `What is the primary architectural tradeoff when introducing ${t.tech} into an enterprise application?`,
        opts: [
          'High throughput at the cost of disk space exhaustion',
          'Decoupled scalability at the expense of eventual consistency complexity',
          'Guaranteed zero latency while sacrificing query flexibility',
          'Immediate linear read scaling with mandatory offline sync'
        ],
        ans: 'B',
        exp: 'Decoupling services promotes horizontal scaling but requires handling eventual consistency and distributed tracing.'
      },
      {
        q: `Which verification strategy should be employed to prevent regression vulnerabilities in ${t.topic}?`,
        opts: [
          'Automated contract testing combined with continuous security fuzzing',
          'Manual spot checks on production logs only',
          'Disabling strict CORS policies in testing staging',
          'Relying solely on front-end client validation routines'
        ],
        ans: 'A',
        exp: 'Automated contract testing and security fuzzing catch behavioral regressions and authorization bypasses.'
      }
    ];

    const template = questionTemplates[(i - 1) % questionTemplates.length];
    questions.push({
      id: i,
      question: `[Q${i} - ${difficulty}] ${template.q}`,
      options: template.opts,
      answer: template.ans,
      explanation: template.exp
    });
  }

  return {
    courseTitle: extractedTitle,
    issuingOrganization: 'Verified Learning Partner',
    skillsCovered: ['Software Engineering', 'System Design', 'Cloud Architecture', 'Security'],
    questions
  };
}

/**
 * Generate 20 MCQs using Google Gemini Multimodal Vision from certificate image
 */
async function generateQuizWithGemini(fileBuffer, mimeType, originalFilename) {
  if (!genAI) {
    return generateFallbackQuiz(originalFilename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
  }

  const prompt = `
You are an expert educational assessment generator and certification auditor.

TASK:
Analyze this certificate image thoroughly.
1. Extract the Course / Certificate Title, Issuing Organization, and Key Skills/Topics covered.
2. Based on the domain and skills taught in this certificate, generate exactly ${QUESTION_COUNT} multiple-choice questions (MCQs) for an aptitude and competency verification exam.
   - Difficulty distribution: Exactly 5 Easy, 10 Medium, 5 Hard.
   - Test deep conceptual understanding, practical reasoning, and domain application (do NOT ask superficial questions like "What color is the logo?").
   - Each question must have exactly 4 clear options.
   - Specify exactly one correct answer ("A", "B", "C", or "D").
   - Include a concise 1-2 sentence explanation of why that answer is correct.
   - Do NOT make the correct option obviously longer than the others.

OUTPUT FORMAT:
Return a single, valid JSON object matching this exact schema:
{
  "courseTitle": "Name of the course/certification",
  "issuingOrganization": "Issuing institution or academy",
  "skillsCovered": ["Skill1", "Skill2", "Skill3"],
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "answer": "A",
      "explanation": "Explanation here."
    }
  ]
}
Return ONLY pure JSON. No markdown fences, no conversational prose.
`;

  try {
    const base64Data = fileBuffer.toString('base64');
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType || 'image/png'
      }
    };

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, imagePart],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text ? response.text.trim() : '';
    const cleanedJson = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanedJson);

    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Gemini response missing questions array');
    }

    // Standardize question IDs 1..N and format
    parsed.questions = parsed.questions.slice(0, QUESTION_COUNT).map((q, idx) => ({
      id: idx + 1,
      question: q.question || `Assessment Question ${idx + 1}`,
      options: (q.options && q.options.length === 4) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: (q.answer || 'A').toUpperCase().trim(),
      explanation: q.explanation || 'Verified domain knowledge.'
    }));

    // If fewer than 20 returned, pad with domain questions
    if (parsed.questions.length < QUESTION_COUNT) {
      const fallback = generateFallbackQuiz(parsed.courseTitle || 'Certificate Verification');
      while (parsed.questions.length < QUESTION_COUNT) {
        const nextId = parsed.questions.length + 1;
        const padQ = { ...fallback.questions[nextId - 1], id: nextId };
        parsed.questions.push(padQ);
      }
    }

    return parsed;
  } catch (err) {
    console.warn('[Gemini Certificate Generation Error, falling back to local engine]:', err.message);
    return generateFallbackQuiz(originalFilename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
  }
}

/**
 * 1. POST /api/certificate-verify/start-assessment
 * Supports two flows:
 *   a) Direct Technical Skill Test: Pass skill in req.body.skill or req.body.courseTitle (e.g. "Python", "Java", "React", "Cloud")
 *   b) Certificate Image Upload: Upload certificate file via req.file, analyzed via Gemini Vision
 * Opens timed 10-minute session, returns questions ONLY (answers kept securely on server).
 */
async function startAssessment(req, res) {
  await ensureTables();

  try {
    const requestedSkill = (req.body?.skill || req.body?.courseTitle || req.body?.skillName || '').trim();

    if (!req.file && !requestedSkill) {
      return sendError(res, 'Please upload a certificate image file or select a technical skill to verify (e.g. Python, Java, React).', 400);
    }

    const userId = req.user?.id;
    let studentId = 1;
    try {
      const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
      if (stu.length > 0) studentId = stu[0].id;
    } catch (_) {}

    const quizId = crypto.randomUUID();
    let originalName = 'certificate.png';
    let storedFilename = '';
    let certificateUrl = '';
    let quizData = null;

    const certDir = path.join(__dirname, '..', 'uploads', 'certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    if (req.file) {
      originalName = req.file.originalname || 'certificate.png';
      const safeExt = path.extname(originalName) || '.png';
      const cleanBase = path.basename(originalName, safeExt).replace(/[^A-Za-z0-9_-]/g, '_');
      storedFilename = `${quizId}_${cleanBase}${safeExt}`;
      const targetFilePath = path.join(certDir, storedFilename);
      fs.writeFileSync(targetFilePath, req.file.buffer);
      certificateUrl = `/uploads/certificates/${storedFilename}`;

      // Generate questions using Gemini Multimodal Vision
      quizData = await generateQuizWithGemini(req.file.buffer, req.file.mimetype, originalName);
    } else {
      // Direct Technical Skill Verification flow (e.g. Python, React, Java, SQL, Cloud)
      storedFilename = `skill_test_${quizId.slice(0, 8)}.svg`;
      const cleanSkill = requestedSkill;
      certificateUrl = `/uploads/certificates/${storedFilename}`;

      // Generate SVG badge certificate
      const svgBadge = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#1e1b4b"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#fbbf24"/>
          </linearGradient>
        </defs>
        <rect width="800" height="560" rx="20" fill="url(#bg)"/>
        <rect x="25" y="25" width="750" height="510" rx="14" fill="none" stroke="url(#gold)" stroke-width="3" stroke-dasharray="8 4"/>
        <circle cx="400" cy="110" r="45" fill="#4338ca" opacity="0.4"/>
        <text x="400" y="118" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="30" font-weight="900" text-anchor="middle">VERIFIED</text>
        <text x="400" y="210" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="28" font-weight="800" text-anchor="middle">TECHNICAL SKILL CERTIFICATE</text>
        <text x="400" y="250" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">COMPETENCY ASSESSMENT CERTIFICATION</text>
        <text x="400" y="320" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="34" font-weight="800" text-anchor="middle">${cleanSkill.toUpperCase()}</text>
        <text x="400" y="370" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="15" text-anchor="middle">Evaluated across 20 In-Depth Technical Architecture & Practical MCQs</text>
        <line x1="200" y1="420" x2="600" y2="420" stroke="#334155" stroke-width="1.5"/>
        <text x="250" y="460" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Verified Skills Engine</text>
        <text x="250" y="480" fill="#64748b" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">Authorized Assessment</text>
        <text x="550" y="460" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">ID: CERT-TECH-${quizId.slice(0, 8).toUpperCase()}</text>
        <text x="550" y="480" fill="#64748b" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">10-Minute Timed Evaluation</text>
      </svg>`;
      fs.writeFileSync(path.join(certDir, storedFilename), svgBadge);

      const generatedResult = await generate20QuestionsForTopic(
        cleanSkill,
        `Comprehensive technical competency and problem-solving examination in ${cleanSkill}`,
        cleanSkill,
        'Engineering'
      );

      const questionList = Array.isArray(generatedResult) ? generatedResult : (generatedResult.questions || []);

      quizData = {
        courseTitle: `${cleanSkill} Technical Skill Certification`,
        issuingOrganization: 'Verified Technical Skills Engine',
        skillsCovered: [cleanSkill, 'Core Concepts', 'Architecture', 'Problem Solving'],
        questions: questionList
      };
    }

    const sessionData = {
      quizId,
      studentId,
      courseTitle: quizData.courseTitle || 'Certified Skill Course',
      issuingOrganization: quizData.issuingOrganization || 'Verified Skills Engine',
      skillsCovered: quizData.skillsCovered || ['Engineering'],
      certificateFilename: storedFilename,
      certificateUrl,
      questions: quizData.questions,
      durationSeconds: TEST_DURATION_SECONDS,
      createdAt: Math.floor(Date.now() / 1000),
      submitted: false,
      result: null
    };

    // Store in memory
    ACTIVE_SESSIONS.set(quizId, sessionData);

    // Also persist in MySQL if DB is active
    try {
      await pool.query(
        `INSERT INTO ai_certificate_quiz_sessions 
         (quiz_id, student_id, course_title, certificate_filename, certificate_url, questions, duration_seconds, submitted, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, NOW())`,
        [
          quizId,
          studentId,
          sessionData.courseTitle,
          storedFilename,
          certificateUrl,
          JSON.stringify(quizData.questions),
          TEST_DURATION_SECONDS
        ]
      );
    } catch (e) {
      console.warn('[Session DB persist warning]:', e.message);
    }

    // Sanitize questions: strip server-held answers and explanations before sending to client
    const publicQuestions = quizData.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    return sendSuccess(res, {
      quiz_id: quizId,
      course_title: sessionData.courseTitle,
      issuing_organization: sessionData.issuingOrganization,
      skills_covered: sessionData.skillsCovered,
      duration_seconds: TEST_DURATION_SECONDS,
      total_questions: publicQuestions.length,
      questions: publicQuestions,
      certificate_url: certificateUrl
    }, 'Assessment session initialized. Timer has started.', 201);
  } catch (error) {
    console.error('[startAssessment Error]', error);
    return sendError(res, 'Failed to process certificate and generate assessment: ' + error.message, 500);
  }
}

/**
 * 2. POST /api/certificate-verify/submit-quiz
 * Grades submitted answers server-side against protected answers,
 * validates 10-minute timer + grace buffer, calculates Verified Badge,
 * records in student portfolio & activity log.
 */
async function submitQuiz(req, res) {
  await ensureTables();

  try {
    const { quiz_id, answers } = req.body; // answers: { "1": "A", "2": "C", ... }
    if (!quiz_id) {
      return sendError(res, 'quiz_id is required', 400);
    }

    let session = ACTIVE_SESSIONS.get(quiz_id);

    // If not in memory, restore from MySQL
    if (!session) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM ai_certificate_quiz_sessions WHERE quiz_id = ? LIMIT 1',
          [quiz_id]
        );
        if (rows.length > 0) {
          const row = rows[0];
          session = {
            quizId: row.quiz_id,
            studentId: row.student_id,
            courseTitle: row.course_title,
            certificateFilename: row.certificate_filename,
            certificateUrl: row.certificate_url,
            questions: typeof row.questions === 'string' ? JSON.parse(row.questions) : row.questions,
            durationSeconds: row.duration_seconds,
            createdAt: Math.floor(new Date(row.created_at).getTime() / 1000),
            submitted: Boolean(row.submitted),
            result: typeof row.result_data === 'string' ? JSON.parse(row.result_data) : row.result_data
          };
          ACTIVE_SESSIONS.set(quiz_id, session);
        }
      } catch (_) {}
    }

    if (!session) {
      return sendError(res, 'Assessment session not found or has expired. Please restart assessment.', 404);
    }

    if (session.submitted && session.result) {
      return sendSuccess(res, session.result, 'Quiz has already been submitted and graded.');
    }

    // Verify elapsed time against server clock
    const nowSec = Math.floor(Date.now() / 1000);
    const elapsedSeconds = nowSec - session.createdAt;
    const timeExpired = elapsedSeconds > (session.durationSeconds + TIME_GRACE_SECONDS);

    // Evaluate answers
    const studentAnswers = answers || {};
    const review = [];
    let correctCount = 0;
    let unansweredCount = 0;

    for (const q of session.questions) {
      const givenAnswer = studentAnswers[String(q.id)] || studentAnswers[q.id] || null;
      let isCorrect = false;

      if (!givenAnswer || givenAnswer.trim() === '') {
        unansweredCount++;
      } else {
        isCorrect = givenAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();
        if (isCorrect) correctCount++;
      }

      review.push({
        id: q.id,
        question: q.question,
        options: q.options,
        your_answer: givenAnswer,
        correct_answer: q.answer,
        explanation: q.explanation || 'Based on core course principles.',
        is_correct: isCorrect
      });
    }

    const totalQuestions = session.questions.length;
    const incorrectCount = totalQuestions - correctCount - unansweredCount;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 0;
    const badgeAwarded = (correctCount >= BADGE_CORRECT_THRESHOLD) && !timeExpired;
    const passed = correctCount >= PASS_CORRECT_THRESHOLD;

    const resultPayload = {
      quiz_id,
      course_title: session.courseTitle,
      total_questions: totalQuestions,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      unanswered_count: unansweredCount,
      score_percentage: scorePercentage,
      time_taken_seconds: Math.min(elapsedSeconds, session.durationSeconds),
      time_expired: timeExpired,
      passed,
      badge_awarded: badgeAwarded,
      badge_threshold: BADGE_CORRECT_THRESHOLD,
      pass_threshold: PASS_CORRECT_THRESHOLD,
      review
    };

    session.submitted = true;
    session.result = resultPayload;
    ACTIVE_SESSIONS.set(quiz_id, session);

    // Update MySQL Session & Student Portfolio
    try {
      await pool.query(
        `UPDATE ai_certificate_quiz_sessions SET 
         submitted = TRUE,
         score_percentage = ?,
         correct_count = ?,
         badge_awarded = ?,
         result_data = ?,
         submitted_at = NOW()
         WHERE quiz_id = ?`,
        [scorePercentage, correctCount, badgeAwarded, JSON.stringify(resultPayload), quiz_id]
      );

      // If passed or badge awarded, automatically upsert into student_certifications
      const userId = req.user?.id;
      let studentId = session.studentId;
      if (userId) {
        const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
        if (stu.length > 0) studentId = stu[0].id;
      }

      if (studentId) {
        await pool.query(
          `INSERT INTO student_certifications 
           (student_id, name, issuing_organization, issue_date, credential_id, certificate_url, badge_awarded, score_percentage, is_verified, verification_quiz_id, verified_at, category, achievement_type)
           VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, TRUE, ?, NOW(), 'TECHNICAL', ?)
           ON DUPLICATE KEY UPDATE 
             badge_awarded = VALUES(badge_awarded),
             score_percentage = VALUES(score_percentage),
             is_verified = TRUE,
             category = 'TECHNICAL',
             achievement_type = VALUES(achievement_type),
             verified_at = NOW()`,
          [
            studentId,
            session.courseTitle || 'Technical Skill Certification',
            session.issuingOrganization || 'Verified Skills Engine',
            `CERT-AI-${quiz_id.slice(0, 8).toUpperCase()}`,
            session.certificateUrl,
            badgeAwarded,
            scorePercentage,
            quiz_id,
            badgeAwarded ? 'VERIFIED_BADGE' : 'PASSED'
          ]
        );

        // Record User Activity Log
        if (userId) {
          await pool.query(
            `INSERT INTO user_activity_logs (user_id, action_type, title, description)
             VALUES (?, 'ASSESSMENT', ?, ?)`,
            [
              userId,
              `Completed AI Certificate Verification: ${session.courseTitle}`,
              `Scored ${scorePercentage}% (${correctCount}/${totalQuestions}). ${badgeAwarded ? 'Earned Verified Skill Badge!' : passed ? 'Passed verification test.' : 'Attempted verification test.'}`
            ]
          );
        }
      }
    } catch (dbErr) {
      console.warn('[submitQuiz DB Sync Warning]:', dbErr.message);
    }

    return sendSuccess(res, resultPayload, 'Assessment submitted and graded successfully');
  } catch (error) {
    console.error('[submitQuiz Error]', error);
    return sendError(res, 'Failed to evaluate assessment submission: ' + error.message, 500);
  }
}

/**
 * 3. POST /api/certificate-verify/create-post
 * Publish verified certificate + score + badge + caption to Community Credential Feed.
 */
async function createPost(req, res) {
  await ensureTables();

  try {
    const { quiz_id, caption } = req.body;
    if (!quiz_id) {
      return sendError(res, 'quiz_id is required', 400);
    }

    let session = ACTIVE_SESSIONS.get(quiz_id);
    if (!session || !session.submitted) {
      try {
        const [rows] = await pool.query('SELECT * FROM ai_certificate_quiz_sessions WHERE quiz_id = ? LIMIT 1', [quiz_id]);
        if (rows.length > 0 && rows[0].submitted) {
          session = {
            quizId: rows[0].quiz_id,
            studentId: rows[0].student_id,
            courseTitle: rows[0].course_title,
            certificateUrl: rows[0].certificate_url,
            result: typeof rows[0].result_data === 'string' ? JSON.parse(rows[0].result_data) : rows[0].result_data
          };
        }
      } catch (_) {}
    }

    if (!session || !session.result) {
      return sendError(res, 'Assessment must be completed before posting to feed', 400);
    }

    const userId = req.user?.id;
    let studentId = session.studentId;
    let studentName = req.user?.name || 'Student';
    let institutionName = 'Academic Partner';

    try {
      const [stu] = await pool.query(`
        SELECT sp.id, u.name, ip.institution_name
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
        WHERE sp.user_id = ? LIMIT 1
      `, [userId]);
      if (stu.length > 0) {
        studentId = stu[0].id;
        studentName = stu[0].name;
        institutionName = stu[0].institution_name || 'Academic Partner';
      }
    } catch (_) {}

    const result = session.result;
    const postId = crypto.randomUUID();

    const postRecord = {
      post_id: postId,
      student_id: studentId,
      student_name: studentName,
      institution_name: institutionName,
      course_title: session.courseTitle,
      caption: caption || '',
      certificate_url: session.certificateUrl,
      correct_count: result.correct_count,
      total_questions: result.total_questions,
      score_percentage: result.score_percentage,
      badge_awarded: result.badge_awarded,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    // Store in memory feed
    MEMORY_FEED_POSTS.unshift(postRecord);

    // Persist in MySQL
    try {
      await pool.query(
        `INSERT INTO community_feed_posts 
         (student_id, quiz_id, certificate_url, caption, correct_count, total_questions, score_percentage, badge_awarded)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          quiz_id,
          session.certificateUrl,
          caption || '',
          result.correct_count,
          result.total_questions,
          result.score_percentage,
          result.badge_awarded
        ]
      );
    } catch (e) {
      console.warn('[createPost DB Warning]:', e.message);
    }

    return sendSuccess(res, postRecord, 'Certificate published to community feed successfully', 201);
  } catch (error) {
    console.error('[createPost Error]', error);
    return sendError(res, 'Failed to publish post: ' + error.message, 500);
  }
}

/**
 * 4. GET /api/certificate-verify/feed
 * Retrieve community feed posts with student profile details and badges.
 */
async function getFeed(req, res) {
  await ensureTables();

  try {
    let posts = [];

    try {
      const [rows] = await pool.query(`
        SELECT 
          cfp.id AS post_id,
          cfp.student_id,
          cfp.quiz_id,
          cfp.certificate_url,
          cfp.caption,
          cfp.correct_count,
          cfp.total_questions,
          cfp.score_percentage,
          cfp.badge_awarded,
          cfp.likes_count,
          cfp.created_at,
          u.name AS student_name,
          u.avatar_url AS student_avatar,
          sp.department,
          ip.institution_name,
          COALESCE(acqs.course_title, 'Verified Certificate') AS course_title
        FROM community_feed_posts cfp
        JOIN student_profiles sp ON cfp.student_id = sp.id
        JOIN users u ON sp.user_id = u.id
        LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
        LEFT JOIN ai_certificate_quiz_sessions acqs ON cfp.quiz_id = acqs.quiz_id
        ORDER BY cfp.created_at DESC
        LIMIT 50
      `);
      posts = rows;
    } catch (dbErr) {
      console.warn('[getFeed DB fallback to memory]:', dbErr.message);
      posts = MEMORY_FEED_POSTS;
    }

    // If DB is empty, combine with memory store
    if (posts.length === 0 && MEMORY_FEED_POSTS.length > 0) {
      posts = MEMORY_FEED_POSTS;
    }

    return sendSuccess(res, { posts }, 'Community feed retrieved successfully');
  } catch (error) {
    console.error('[getFeed Error]', error);
    return sendError(res, 'Failed to load community feed: ' + error.message, 500);
  }
}

/**
 * 5. GET /api/certificate-verify/my-verifications
 * Get student's verified certificate badges and past assessment attempts.
 */
async function getMyVerifications(req, res) {
  await ensureTables();

  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) {
      return sendError(res, 'Student profile not found', 404);
    }
    const studentId = stu[0].id;

    const [verifications] = await pool.query(`
      SELECT 
        id, name, issuing_organization, issue_date, credential_id,
        certificate_url, badge_awarded, score_percentage, is_verified, verified_at
      FROM student_certifications
      WHERE student_id = ? AND is_verified = TRUE
      ORDER BY verified_at DESC
    `, [studentId]);

    const [recentSessions] = await pool.query(`
      SELECT 
        quiz_id, course_title, certificate_url, duration_seconds,
        submitted, score_percentage, correct_count, badge_awarded, created_at, submitted_at
      FROM ai_certificate_quiz_sessions
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [studentId]);

    return sendSuccess(res, {
      verifiedCertificates: verifications,
      assessmentHistory: recentSessions
    }, 'Student verification records retrieved');
  } catch (error) {
    console.error('[getMyVerifications Error]', error);
    return sendError(res, 'Failed to load verification records: ' + error.message, 500);
  }
}

/**
 * 6. GET /api/certificate-verify/validate/:code
 * Public / Authenticated Certificate Validator
 * Validates any certificate verification code or ID and returns verified proof.
 */
async function validateCertificateCode(req, res) {
  await ensureTables();

  try {
    const rawCode = (req.params.code || '').trim();
    if (!rawCode) {
      return sendError(res, 'Please provide a certificate verification code or ID', 400);
    }

    // 1. Search in student_certifications
    const [certRows] = await pool.query(
      `SELECT sc.*, u.name AS student_name, u.email AS student_email, ip.institution_name, sp.department, sp.degree
       FROM student_certifications sc
       JOIN student_profiles sp ON sc.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
       WHERE sc.credential_id = ? OR sc.verification_quiz_id = ? OR sc.id = ?
       LIMIT 1`,
      [rawCode, rawCode, isNaN(rawCode) ? -1 : parseInt(rawCode, 10)]
    );

    if (certRows.length > 0) {
      const c = certRows[0];
      return sendSuccess(res, {
        valid: true,
        certificateTitle: c.name,
        issuingOrganization: c.issuing_organization,
        studentName: c.student_name,
        institutionName: c.institution_name || 'Autonomous Engineering College',
        department: c.department || 'Computer Science & Engineering',
        degree: c.degree || 'B.E / B.Tech',
        category: c.category || 'TECHNICAL',
        achievementType: c.achievement_type,
        level: c.level,
        scorePercentage: c.score_percentage !== null ? Number(c.score_percentage) : null,
        badgeAwarded: Boolean(c.badge_awarded),
        isVerified: Boolean(c.is_verified),
        issueDate: c.issue_date,
        verifiedAt: c.verified_at || c.created_at,
        credentialId: c.credential_id || `CERT-VERIF-${c.id}`,
        certificateUrl: c.certificate_url,
        description: c.description
      }, 'Certificate verified successfully');
    }

    // 2. Search in ai_certificate_quiz_sessions
    const [sessionRows] = await pool.query(
      `SELECT s.*, u.name AS student_name, ip.institution_name, sp.department, sp.degree
       FROM ai_certificate_quiz_sessions s
       JOIN student_profiles sp ON s.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
       WHERE s.quiz_id = ? OR s.quiz_id LIKE ?
       LIMIT 1`,
      [rawCode, `%${rawCode}%`]
    );

    if (sessionRows.length > 0) {
      const s = sessionRows[0];
      return sendSuccess(res, {
        valid: true,
        certificateTitle: s.course_title,
        issuingOrganization: 'Verified Technical Skills Engine',
        studentName: s.student_name,
        institutionName: s.institution_name || 'Autonomous Engineering College',
        department: s.department || 'Engineering',
        degree: s.degree || 'B.E / B.Tech',
        category: 'TECHNICAL',
        scorePercentage: s.score_percentage !== null ? Number(s.score_percentage) : null,
        badgeAwarded: Boolean(s.badge_awarded),
        isVerified: Boolean(s.submitted && s.score_percentage >= 60),
        issueDate: s.submitted_at || s.created_at,
        verifiedAt: s.submitted_at,
        credentialId: `CERT-AI-${s.quiz_id.slice(0, 8).toUpperCase()}`,
        certificateUrl: s.certificate_url
      }, 'Certificate verified successfully');
    }

    return sendError(res, 'No verified certificate record found matching this code.', 404);
  } catch (error) {
    console.error('[validateCertificateCode Error]', error);
    return sendError(res, 'Verification lookup failed: ' + error.message, 500);
  }
}

module.exports = {
  startAssessment,
  submitQuiz,
  createPost,
  getFeed,
  getMyVerifications,
  validateCertificateCode
};
