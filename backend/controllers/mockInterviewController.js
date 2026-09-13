const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const QUESTION_BANK = {
  'Full Stack Software Engineer': [
    {
      id: 1,
      question: 'How do you handle state management across deeply nested components in a modern React application?',
      expectedKeywords: ['context', 'redux', 'props', 'state', 'hooks', 'performance', 're-render', 'zustand']
    },
    {
      id: 2,
      question: 'Explain how database indexing works in relational databases and what tradeoffs are involved.',
      expectedKeywords: ['b-tree', 'index', 'read', 'write', 'tradeoff', 'performance', 'query', 'overhead', 'table scan']
    },
    {
      id: 3,
      question: 'How do you secure a REST API against common vulnerabilities such as unauthorized access and injection attacks?',
      expectedKeywords: ['jwt', 'token', 'authentication', 'authorization', 'validation', 'cors', 'sql injection', 'sanitize', 'https', 'rate limit']
    },
    {
      id: 4,
      question: 'Tell me about a challenging bug you encountered in a team project and how you resolved it.',
      expectedKeywords: ['debug', 'problem', 'root cause', 'solution', 'team', 'test', 'result', 'log', 'resolved']
    }
  ],
  'Backend Developer': [
    {
      id: 1,
      question: 'What is the difference between monolithic and microservices architectures, and when would you choose one over the other?',
      expectedKeywords: ['monolith', 'microservices', 'scalability', 'coupling', 'deploy', 'independent', 'complexity', 'network']
    },
    {
      id: 2,
      question: 'How does connection pooling in Node.js improve database throughput under high traffic?',
      expectedKeywords: ['connection', 'pool', 'reuse', 'overhead', 'concurrency', 'latency', 'throughput', 'handshake']
    },
    {
      id: 3,
      question: 'Explain the ACID properties of relational transactions with a real-world banking scenario.',
      expectedKeywords: ['atomicity', 'consistency', 'isolation', 'durability', 'rollback', 'commit', 'transaction']
    }
  ],
  'Frontend Engineer': [
    {
      id: 1,
      question: 'Explain the Virtual DOM and the reconciliation algorithm in React.',
      expectedKeywords: ['virtual dom', 'diffing', 'reconciliation', 'render', 'fiber', 'keys', 'efficiency', 'batch']
    },
    {
      id: 2,
      question: 'What strategies do you use to optimize Cumulative Layout Shift (CLS) and Largest Contentful Paint (LCP)?',
      expectedKeywords: ['lcp', 'cls', 'core web vitals', 'images', 'font', 'dimensions', 'cdn', 'lazy load', 'priority']
    },
    {
      id: 3,
      question: 'How do you make complex web user interfaces accessible for screen readers and keyboard users?',
      expectedKeywords: ['aria', 'semantic html', 'keyboard', 'focus', 'contrast', 'accessibility', 'alt text']
    }
  ],
  'Data Scientist / ML Engineer': [
    {
      id: 1,
      question: 'How do you detect and mitigate overfitting in a machine learning model?',
      expectedKeywords: ['overfitting', 'regularization', 'cross-validation', 'dropout', 'pruning', 'training', 'validation', 'dataset']
    },
    {
      id: 2,
      question: 'Explain the difference between Precision and Recall. Which metric would you prioritize for medical disease detection?',
      expectedKeywords: ['precision', 'recall', 'false positive', 'false negative', 'f1-score', 'tradeoff', 'sensitivity']
    },
    {
      id: 3,
      question: 'How do you handle missing values and skewed features during data preprocessing?',
      expectedKeywords: ['imputation', 'median', 'mean', 'outliers', 'log transform', 'scaling', 'normalization']
    }
  ],
  'Cloud & DevOps Engineer': [
    {
      id: 1,
      question: 'Explain the lifecycle of a container from Dockerfile to running in a Kubernetes pod.',
      expectedKeywords: ['dockerfile', 'image', 'container', 'registry', 'pod', 'kubernetes', 'node', 'deploy']
    },
    {
      id: 2,
      question: 'What is the difference between blue-green deployment and canary deployment strategies?',
      expectedKeywords: ['blue-green', 'canary', 'traffic', 'zero downtime', 'rollback', 'release', 'monitoring', 'percentage']
    },
    {
      id: 3,
      question: 'How do you manage secret keys and credentials securely in a CI/CD automation pipeline?',
      expectedKeywords: ['secrets', 'vault', 'environment variables', 'iam', 'encryption', 'pipeline', 'credentials']
    }
  ]
};

const FILLER_WORDS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'literally', 'i mean', 'so yeah'];

/**
 * Get available interview roles and company options
 */
async function getInterviewRoles(req, res) {
  const roles = Object.keys(QUESTION_BANK);
  const companies = ['Google', 'Amazon', 'Microsoft', 'TechCorp Solutions', 'CloudScale Networks', 'General Enterprise'];
  return sendSuccess(res, { roles, companies }, 'Interview roles and companies retrieved');
}

/**
 * Get questions tailored for role and company
 */
async function getInterviewQuestions(req, res) {
  const { role, company } = req.query;
  const targetRole = role || 'Full Stack Software Engineer';
  const questions = QUESTION_BANK[targetRole] || QUESTION_BANK['Full Stack Software Engineer'];

  return sendSuccess(res, {
    role: targetRole,
    company: company || 'TechCorp Solutions',
    questions: questions.map(q => ({ id: q.id, question: q.question }))
  }, 'Interview questions generated');
}

/**
 * Submit and analyze full mock interview
 */
async function submitInterview(req, res) {
  const userId = req.user.id;
  const { role_title, company_name, answers } = req.body; // answers: [{ question_id, question, user_response }]

  try {
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return sendError(res, 'Please provide responses to analyze', 400);
    }

    let totalWords = 0;
    let totalFillerWords = 0;
    let totalTechScore = 0;
    let totalConfidenceScore = 0;
    let totalCommScore = 0;

    const analyzedQuestions = [];

    answers.forEach((item, index) => {
      const text = (item.user_response || '').trim();
      const words = text.length > 0 ? text.split(/\s+/) : [];
      const wordCount = words.length;
      totalWords += wordCount;

      // Filler words analysis
      let fillerCount = 0;
      const lowerText = text.toLowerCase();
      FILLER_WORDS.forEach(fw => {
        const regex = new RegExp(`\\b${fw}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) fillerCount += matches.length;
      });
      totalFillerWords += fillerCount;

      // Keyword & Technical Depth matching
      const targetQuestions = QUESTION_BANK[role_title] || QUESTION_BANK['Full Stack Software Engineer'];
      const qMeta = targetQuestions.find(q => q.id === item.question_id) || targetQuestions[index % targetQuestions.length];
      const expectedKeywords = qMeta?.expectedKeywords || ['architecture', 'performance', 'design', 'test'];

      const matchedKeywords = [];
      expectedKeywords.forEach(kw => {
        if (lowerText.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
        }
      });

      const keywordCoverage = expectedKeywords.length > 0 
        ? Math.min(100, Math.round((matchedKeywords.length / (expectedKeywords.length * 0.6)) * 100))
        : 70;

      // Per-question Technical Score
      let qTechScore = 50;
      if (wordCount >= 20) qTechScore += 15;
      if (wordCount >= 40) qTechScore += 10;
      qTechScore = Math.min(100, Math.round((qTechScore * 0.4) + (keywordCoverage * 0.6)));

      // Per-question Confidence Score (punish filler words, reward decisive phrases and length)
      let qConfidence = 80;
      if (wordCount < 15) qConfidence -= 25;
      else if (wordCount >= 30) qConfidence += 10;
      qConfidence -= Math.min(30, fillerCount * 6);
      qConfidence = Math.max(35, Math.min(98, qConfidence));

      // Per-question Communication Clarity
      let qComm = 75;
      if (wordCount >= 25 && wordCount <= 120) qComm += 15;
      if (fillerCount === 0) qComm += 10;
      else qComm -= Math.min(25, fillerCount * 5);
      qComm = Math.max(40, Math.min(96, qComm));

      totalTechScore += qTechScore;
      totalConfidenceScore += qConfidence;
      totalCommScore += qComm;

      analyzedQuestions.push({
        question_id: item.question_id,
        question: item.question,
        user_response: item.user_response,
        word_count: wordCount,
        filler_count: fillerCount,
        matched_keywords: matchedKeywords,
        technical_score: qTechScore,
        confidence_score: qConfidence,
        communication_score: qComm,
        critique: wordCount < 20 
          ? 'Answer is concise but lacks technical elaboration and concrete examples.'
          : matchedKeywords.length > 2 
            ? 'Strong response with precise domain vocabulary and good structure.'
            : 'Good explanation; incorporate more architecture keywords for higher scoring.'
      });
    });

    const questionCount = answers.length;
    const finalTechScore = Math.round(totalTechScore / questionCount);
    const finalConfidenceScore = Math.round(totalConfidenceScore / questionCount);
    const finalCommScore = Math.round(totalCommScore / questionCount);
    const finalOverallScore = Math.round((finalTechScore * 0.45) + (finalConfidenceScore * 0.30) + (finalCommScore * 0.25));

    // Generate comprehensive summary
    let summaryText = '';
    if (finalOverallScore >= 80) {
      summaryText = `Outstanding performance! Candidate demonstrated advanced technical mastery for ${role_title} at ${company_name || 'Top Tier Companies'}. Communication was structured, articulate, and exhibited high confidence with negligible hesitation.`;
    } else if (finalOverallScore >= 65) {
      summaryText = `Solid performance with commendable technical knowledge. Candidate articulates core principles well but can elevate responses by citing specific engineering tradeoffs, quantitative metrics, and reducing occasional filler words.`;
    } else {
      summaryText = `Developing readiness. Answers were somewhat brief or lacked key technical vocabulary. We recommend reviewing fundamental architecture patterns and practicing structured STAR-format responses.`;
    }

    // Insert into mock_interviews
    const [insertResult] = await pool.query(
      `INSERT INTO mock_interviews (student_id, role_title, company_name, overall_score, confidence_score, technical_score, communication_score, words_analyzed, filler_words_count, feedback_summary, transcript)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        role_title || 'Full Stack Software Engineer',
        company_name || 'TechCorp Solutions',
        finalOverallScore,
        finalConfidenceScore,
        finalTechScore,
        finalCommScore,
        totalWords,
        totalFillerWords,
        summaryText,
        JSON.stringify(analyzedQuestions)
      ]
    );

    // Record in user activity logs
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'MOCK_INTERVIEW', ?, ?)`,
      [
        userId,
        `Completed AI Mock Interview: ${company_name || role_title}`,
        `Achieved ${finalOverallScore}% overall readiness (Tech: ${finalTechScore}%, Confidence: ${finalConfidenceScore}%, Comm: ${finalCommScore}%).`
      ]
    );

    const report = {
      interviewId: insertResult.insertId,
      overallScore: finalOverallScore,
      confidenceScore: finalConfidenceScore,
      technicalScore: finalTechScore,
      communicationScore: finalCommScore,
      totalWordsAnalyzed: totalWords,
      fillerWordsDetected: totalFillerWords,
      feedbackSummary: summaryText,
      questionsFeedback: analyzedQuestions,
      roleTitle: role_title,
      companyName: company_name
    };

    return sendSuccess(res, report, 'Mock interview analyzed successfully', 201);
  } catch (error) {
    console.error('[MockInterview submitInterview Error]', error);
    return sendError(res, 'Failed to analyze mock interview: ' + error.message, 500);
  }
}

/**
 * Get past mock interviews for student
 */
async function getInterviewHistory(req, res) {
  const userId = req.user.id;

  try {
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const [rows] = await pool.query(
      `SELECT id, role_title, company_name, overall_score, confidence_score, technical_score, communication_score, words_analyzed, created_at
       FROM mock_interviews
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
    );

    return sendSuccess(res, rows, 'Mock interview history retrieved');
  } catch (error) {
    console.error('[MockInterview getInterviewHistory Error]', error);
    return sendError(res, 'Failed to fetch interview history', 500);
  }
}

/**
 * Get specific interview session report
 */
async function getInterviewById(req, res) {
  const interviewId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM mock_interviews WHERE id = ? LIMIT 1', [interviewId]);
    if (rows.length === 0) return sendError(res, 'Interview report not found', 404);

    const interview = rows[0];
    try {
      interview.transcript = typeof interview.transcript === 'string' ? JSON.parse(interview.transcript) : interview.transcript;
    } catch (e) {
      interview.transcript = [];
    }

    return sendSuccess(res, interview, 'Interview report details retrieved');
  } catch (error) {
    console.error('[MockInterview getInterviewById Error]', error);
    return sendError(res, 'Failed to fetch report', 500);
  }
}

module.exports = {
  getInterviewRoles,
  getInterviewQuestions,
  submitInterview,
  getInterviewHistory,
  getInterviewById
};
