const crypto = require('crypto');
const { pool } = require('../config/db');
const { calculateSkillMatch } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generate20QuestionsForTopic, evaluateTopicAnswers } = require('../services/topicAssessmentService');

/**
 * List all available career paths and company roadmaps with department & domain filtering
 */
async function getRoadmaps(req, res) {
  try {
    const userId = req.user?.id;
    const { department, domain, category, search } = req.query;
    let studentProfile = null;

    if (req.user?.role === 'STUDENT') {
      const [stu] = await pool.query(
        `SELECT sp.*, u.name, u.email 
         FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id 
         WHERE sp.user_id = ? LIMIT 1`,
        [userId]
      );
      if (stu.length > 0) studentProfile = stu[0];
    }

    let query = `
      SELECT rp.*,
        COUNT(DISTINCT rt.id) AS total_tasks,
        COUNT(DISTINCT rm.id) AS total_milestones
      FROM roadmap_paths rp
      LEFT JOIN roadmap_milestones rm ON rp.id = rm.roadmap_id
      LEFT JOIN roadmap_tasks rt ON rm.id = rt.milestone_id
      WHERE (rp.created_by_student_id IS NULL ${studentProfile ? 'OR rp.created_by_student_id = ?' : ''})
    `;
    const params = studentProfile ? [studentProfile.id] : [];

    if (category && category !== 'ALL') {
      query += ' AND rp.category = ?';
      params.push(category);
    }

    if (department && department !== 'ALL') {
      query += ' AND (rp.department = ? OR rp.department = "ALL")';
      params.push(department);
    }

    if (domain && domain !== 'ALL') {
      query += ' AND rp.domain = ?';
      params.push(domain);
    }

    if (search && search.trim()) {
      query += ' AND (rp.title LIKE ? OR rp.target_role LIKE ? OR rp.company_name LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ' GROUP BY rp.id ORDER BY (rp.created_by_student_id IS NOT NULL) DESC, rp.id ASC';

    const [roadmaps] = await pool.query(query, params);

    // Calculate completion % and personalized recommendation
    for (const r of roadmaps) {
      if (studentProfile) {
        const [done] = await pool.query(
          `SELECT COUNT(*) AS completed_count 
           FROM student_roadmap_tasks 
           WHERE student_id = ? AND roadmap_id = ? AND is_completed = TRUE`,
          [studentProfile.id, r.id]
        );
        const completed = done[0]?.completed_count || 0;
        r.completedTasks = completed;
        r.progressPercentage = r.total_tasks > 0 ? Math.round((completed / r.total_tasks) * 100) : 0;

        // Personalized recommendation matching
        const studentDept = (studentProfile.department || '').toLowerCase();
        const studentRole = (studentProfile.headline || studentProfile.degree || '').toLowerCase();
        const roadmapDept = (r.department || '').toLowerCase();
        const roadmapRole = (r.target_role || '').toLowerCase();

        const deptMatch = roadmapDept === 'all' || studentDept.includes(roadmapDept) || roadmapDept.includes(studentDept);
        const roleMatch = studentRole && (roadmapRole.includes(studentRole) || studentRole.includes(roadmapRole));

        r.isCustom = Boolean(r.created_by_student_id);
        r.isRecommended = Boolean(r.isCustom || deptMatch || roleMatch);
      } else {
        r.completedTasks = 0;
        r.progressPercentage = 0;
        r.isCustom = false;
        r.isRecommended = false;
      }
    }

    return sendSuccess(res, roadmaps, 'Roadmaps retrieved successfully');
  } catch (error) {
    console.error('[Roadmap getRoadmaps Error]', error);
    return sendError(res, 'Failed to fetch roadmaps', 500);
  }
}

/**
 * Get detailed roadmap with milestones, tasks, completion status, and company match
 */
async function getRoadmapById(req, res) {
  const roadmapId = req.params.id;
  const userId = req.user.id;

  try {
    const [stu] = await pool.query('SELECT id, department FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const student = stu[0];
    const studentId = student.id;

    // 1. Get Roadmap details
    const [rows] = await pool.query('SELECT * FROM roadmap_paths WHERE id = ? LIMIT 1', [roadmapId]);
    if (rows.length === 0) return sendError(res, 'Roadmap not found', 404);
    const roadmap = rows[0];

    // 2. Get Milestones
    const [milestones] = await pool.query(
      'SELECT * FROM roadmap_milestones WHERE roadmap_id = ? ORDER BY step_order ASC',
      [roadmapId]
    );

    let totalTasks = 0;
    let completedTasks = 0;

    // 3. For each milestone, get tasks and student completion
    for (const m of milestones) {
      const [tasks] = await pool.query(
        `SELECT rt.*, s.name as skill_name, 
                srt.is_completed, srt.completed_at, srt.score_percentage, 
                srt.badge_awarded, srt.verification_code
         FROM roadmap_tasks rt
         LEFT JOIN skills s ON rt.skill_id = s.id
         LEFT JOIN student_roadmap_tasks srt ON rt.id = srt.task_id AND srt.student_id = ?
         WHERE rt.milestone_id = ?
         ORDER BY rt.id ASC`,
        [studentId, m.id]
      );

      m.tasks = tasks.map(t => ({
        ...t,
        is_completed: Boolean(t.is_completed),
        badge_awarded: Boolean(t.badge_awarded)
      }));

      totalTasks += tasks.length;
      completedTasks += m.tasks.filter(t => t.is_completed).length;
    }

    roadmap.milestones = milestones;
    roadmap.totalTasks = totalTasks;
    roadmap.completedTasks = completedTasks;
    roadmap.progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 4. Calculate Company Match Percentage against target skills
    let targetSkills = [];
    try {
      targetSkills = typeof roadmap.target_skills === 'string' 
        ? JSON.parse(roadmap.target_skills) 
        : (roadmap.target_skills || []);
    } catch (e) {
      targetSkills = [];
    }

    const [studentSkills] = await pool.query(
      'SELECT ss.skill_id, ss.score, ss.level, s.name as skill_name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?',
      [studentId]
    );

    const matchReqSkills = targetSkills.map(ts => ({
      skill_id: ts.skill_id,
      skill_name: ts.skill_name,
      min_required_score: ts.min_score || 75,
      is_mandatory: true
    }));

    const matchResult = calculateSkillMatch(studentSkills, matchReqSkills);
    roadmap.companyMatch = {
      score: matchResult.matchScore,
      targetRole: roadmap.target_role,
      companyName: roadmap.company_name || 'Industry Standard',
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      skillGaps: matchResult.skillGaps
    };
    roadmap.isCustom = Boolean(roadmap.created_by_student_id);
    roadmap.isOwner = Boolean(studentId && roadmap.created_by_student_id === studentId);

    return sendSuccess(res, roadmap, 'Detailed roadmap retrieved');
  } catch (error) {
    console.error('[Roadmap getRoadmapById Error]', error);
    return sendError(res, 'Failed to fetch roadmap details', 500);
  }
}

/**
 * Toggle task completion status
 */
async function toggleTask(req, res) {
  const { id: roadmapId, taskId } = req.params;
  const userId = req.user.id;

  try {
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    // Check current task status
    const [existing] = await pool.query(
      'SELECT is_completed FROM student_roadmap_tasks WHERE student_id = ? AND task_id = ? LIMIT 1',
      [studentId, taskId]
    );

    const currentlyCompleted = existing.length > 0 && Boolean(existing[0].is_completed);
    const nextStatus = !currentlyCompleted;

    await pool.query(
      `INSERT INTO student_roadmap_tasks (student_id, task_id, roadmap_id, is_completed, completed_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE is_completed = VALUES(is_completed), completed_at = VALUES(completed_at)`,
      [studentId, taskId, roadmapId, nextStatus, nextStatus ? new Date() : null]
    );

    // If marked as completed, record activity log
    if (nextStatus) {
      const [taskRow] = await pool.query('SELECT title FROM roadmap_tasks WHERE id = ? LIMIT 1', [taskId]);
      const taskTitle = taskRow[0]?.title || 'Roadmap Task';
      await pool.query(
        `INSERT INTO user_activity_logs (user_id, action_type, title, description)
         VALUES (?, 'ROADMAP_TASK', ?, ?)`,
        [userId, `Completed Task: ${taskTitle}`, `Marked task as done in roadmap.`]
      );
    }

    return sendSuccess(res, { is_completed: nextStatus }, 'Task status toggled');
  } catch (error) {
    console.error('[Roadmap toggleTask Error]', error);
    return sendError(res, 'Failed to update task', 500);
  }
}

/**
 * Generate 20-Question Topic Assessment for a roadmap task
 * (Item 1: Ask 20 questions related to that topic/work)
 */
async function getTaskAssessment(req, res) {
  const { id: roadmapId, taskId } = req.params;
  const userId = req.user.id;

  try {
    const [stu] = await pool.query('SELECT id, department FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    // Fetch task, milestone, and roadmap
    const [tasks] = await pool.query(
      `SELECT rt.*, rm.title as milestone_title, rp.title as roadmap_title, rp.department as roadmap_dept, s.name as skill_name
       FROM roadmap_tasks rt
       JOIN roadmap_milestones rm ON rt.milestone_id = rm.id
       JOIN roadmap_paths rp ON rm.roadmap_id = rp.id
       LEFT JOIN skills s ON rt.skill_id = s.id
       WHERE rt.id = ? AND rp.id = ? LIMIT 1`,
      [taskId, roadmapId]
    );

    if (tasks.length === 0) {
      return sendError(res, 'Roadmap task not found', 404);
    }
    const task = tasks[0];

    // Generate 20 questions
    const generated = await generate20QuestionsForTopic(
      task.title,
      task.description,
      task.skill_name,
      task.roadmap_dept || stu[0].department
    );

    const sessionId = `task_quiz_${studentId}_${taskId}_${Date.now()}`;

    // Store in DB session table
    await pool.query(
      `INSERT INTO roadmap_task_quiz_sessions 
        (id, student_id, roadmap_id, task_id, topic_title, questions, duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?, 600)`,
      [sessionId, studentId, roadmapId, taskId, task.title, JSON.stringify(generated.questions)]
    );

    // Strip correct answers before sending to client to prevent inspection cheating
    const clientQuestions = generated.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    return sendSuccess(res, {
      sessionId,
      roadmapId: parseInt(roadmapId, 10),
      taskId: parseInt(taskId, 10),
      taskTitle: task.title,
      roadmapTitle: task.roadmap_title,
      milestoneTitle: task.milestone_title,
      department: task.roadmap_dept,
      durationSeconds: 600, // 10 minutes
      totalQuestions: clientQuestions.length,
      questions: clientQuestions
    }, '20-Question Topic Assessment generated successfully');
  } catch (error) {
    console.error('[Roadmap getTaskAssessment Error]', error);
    return sendError(res, 'Failed to generate topic assessment: ' + error.message, 500);
  }
}

/**
 * Submit 20-Question Topic Assessment answers, evaluate results,
 * automatically check task in roadmap, award certificate verification code & update progress
 */
async function submitTaskAssessment(req, res) {
  const { id: roadmapId, taskId } = req.params;
  const { sessionId, answers = {} } = req.body;
  const userId = req.user.id;

  try {
    const [stu] = await pool.query('SELECT id, department FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    // Retrieve quiz session
    const [sessions] = await pool.query(
      'SELECT * FROM roadmap_task_quiz_sessions WHERE id = ? AND student_id = ? AND task_id = ? LIMIT 1',
      [sessionId, studentId, taskId]
    );

    if (sessions.length === 0) {
      return sendError(res, 'Assessment session not found or expired', 404);
    }
    const session = sessions[0];

    const questionsWithAnswers = typeof session.questions === 'string'
      ? JSON.parse(session.questions)
      : session.questions;

    // Evaluate answers
    const evaluation = evaluateTopicAnswers(questionsWithAnswers, answers);

    // 1. Update session in DB
    await pool.query(
      `UPDATE roadmap_task_quiz_sessions SET
        submitted = 1,
        score_percentage = ?,
        correct_count = ?,
        badge_awarded = ?,
        verification_code = ?,
        submitted_at = NOW()
       WHERE id = ?`,
      [
        evaluation.scorePercentage,
        evaluation.correctCount,
        evaluation.badgeAwarded ? 1 : 0,
        evaluation.verificationCode,
        sessionId
      ]
    );

    // 2. AUTOMATICALLY CHECK TASK IN ROADMAP (Core User Requirement #1)
    await pool.query(
      `INSERT INTO student_roadmap_tasks 
        (student_id, task_id, roadmap_id, is_completed, completed_at, score_percentage, badge_awarded, verification_code, quiz_session_id)
       VALUES (?, ?, ?, 1, NOW(), ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        is_completed = 1,
        completed_at = NOW(),
        score_percentage = VALUES(score_percentage),
        badge_awarded = VALUES(badge_awarded),
        verification_code = VALUES(verification_code),
        quiz_session_id = VALUES(quiz_session_id)`,
      [
        studentId,
        taskId,
        roadmapId,
        evaluation.scorePercentage,
        evaluation.badgeAwarded ? 1 : 0,
        evaluation.verificationCode,
        sessionId
      ]
    );

    // 3. Insert Verified Credential into student_certifications
    try {
      await pool.query(
        `INSERT INTO student_certifications 
          (student_id, certificate_name, issuing_organization, issue_date, credential_id, verification_url, verification_code, badge_awarded, score_percentage, is_verified, verified_at)
         VALUES (?, ?, 'AI Skill Verification Engine', CURDATE(), ?, ?, ?, ?, ?, 1, NOW())`,
        [
          studentId,
          `${session.topic_title} Mastery`,
          evaluation.verificationCode,
          `/student/certificate-verify?code=${evaluation.verificationCode}`,
          evaluation.verificationCode,
          evaluation.badgeAwarded ? 1 : 0,
          evaluation.scorePercentage
        ]
      );
    } catch (e) {
      console.warn('[submitTaskAssessment] Warning saving certificate record:', e.message);
    }

    // 4. Record user activity log
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'ROADMAP_TASK', ?, ?)`,
      [
        userId,
        `Verified Topic: ${session.topic_title}`,
        `Scored ${evaluation.scorePercentage}% on 20-Q assessment. Badge: ${evaluation.badgeAwarded ? 'AWARDED' : 'NOT AWARDED'}`
      ]
    );

    // 5. Recalculate roadmap progress
    const [totalRows] = await pool.query(
      `SELECT COUNT(rt.id) as total_tasks 
       FROM roadmap_tasks rt 
       JOIN roadmap_milestones rm ON rt.milestone_id = rm.id 
       WHERE rm.roadmap_id = ?`,
      [roadmapId]
    );
    const [completedRows] = await pool.query(
      `SELECT COUNT(*) as completed_count 
       FROM student_roadmap_tasks 
       WHERE student_id = ? AND roadmap_id = ? AND is_completed = TRUE`,
      [studentId, roadmapId]
    );

    const totalTasks = totalRows[0]?.total_tasks || 1;
    const completedTasks = completedRows[0]?.completed_count || 0;
    const completionPercentage = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

    return sendSuccess(res, {
      taskId: parseInt(taskId, 10),
      roadmapId: parseInt(roadmapId, 10),
      topicTitle: session.topic_title,
      scorePercentage: evaluation.scorePercentage,
      correctCount: evaluation.correctCount,
      totalQuestions: evaluation.totalQuestions,
      passed: evaluation.passed,
      badgeAwarded: evaluation.badgeAwarded,
      verificationCode: evaluation.verificationCode,
      isCompleted: true,
      updatedProgress: {
        totalTasks,
        completedTasks,
        completionPercentage
      },
      questionsReview: evaluation.questionsReview
    }, 'Assessment submitted and task marked verified!');
  } catch (error) {
    console.error('[Roadmap submitTaskAssessment Error]', error);
    return sendError(res, 'Failed to submit assessment: ' + error.message, 500);
  }
}

/**
 * Synthesizes a structured, highly realistic 4-phase curriculum
 * based on user's target role, company, difficulty, duration, and focus topics.
 */
function synthesizeCurriculum(targetRole, companyName, difficulty = 'INTERMEDIATE', estimatedWeeks = 12, focusTopics = '', department = 'ALL', domain = '') {
  const roleLower = (targetRole || '').toLowerCase();
  const topicsLower = (focusTopics || '').toLowerCase();
  const companyLower = (companyName || '').toLowerCase();
  const combined = `${roleLower} ${topicsLower} ${companyLower}`.trim();

  const cleanRole = targetRole ? targetRole.trim() : 'Software Engineer';
  const cleanCompany = companyName ? companyName.trim() : null;

  let milestones = [];

  const isAI = combined.includes('ai') || combined.includes('machine learning') || combined.includes('deep learning') || combined.includes('data') || combined.includes('vision') || combined.includes('nlp') || combined.includes('pytorch') || combined.includes('tensorflow') || combined.includes('slam') || combined.includes('autonomous');
  const isCloud = combined.includes('cloud') || combined.includes('devops') || combined.includes('sre') || combined.includes('kubernetes') || combined.includes('terraform') || combined.includes('aws') || combined.includes('azure') || combined.includes('gcp');
  const isBigTech = cleanCompany && (companyLower.includes('google') || companyLower.includes('amazon') || companyLower.includes('microsoft') || companyLower.includes('meta') || companyLower.includes('apple') || companyLower.includes('netflix') || combined.includes('sde') || combined.includes('swe') || combined.includes('leetcode'));
  const isWeb = combined.includes('full stack') || combined.includes('web') || combined.includes('frontend') || combined.includes('react') || combined.includes('mern') || combined.includes('next') || combined.includes('express');

  if (isAI) {
    milestones = [
      {
        step_order: 1,
        title: 'Phase 1: Mathematical Foundations & Exploratory Data Analysis',
        description: 'Master Python for data engineering, linear algebra, vector calculus, and statistical hypothesis testing.',
        tasks: [
          { title: 'Vectorized Computing with NumPy & Data Wrangling with Pandas', description: 'Process multi-dimensional tensors, handle missing values, and execute grouping aggregations.', skill_name: 'Python', estimated_hours: 8, difficulty: 'EASY' },
          { title: 'Exploratory Data Analysis (EDA) & Feature Distribution Visualization', description: 'Build statistical visual pipelines using Matplotlib/Seaborn and analyze skewness and outliers.', skill_name: 'Python', estimated_hours: 6, difficulty: 'MEDIUM' },
          { title: 'Relational Analytical SQL & Window Functions for Feature Extraction', description: 'Write window functions, CTEs, and time-series rollups to prepare datasets.', skill_name: 'SQL & Relational DBs', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 2,
        title: 'Phase 2: Supervised & Unsupervised Machine Learning Algorithms',
        description: 'Implement core ML algorithms, hyperparameter tuning, and cross-validation pipelines.',
        tasks: [
          { title: 'Linear Models, Decision Trees & Ensemble Methods (Random Forest, XGBoost)', description: 'Train classification and regression models; evaluate ROC-AUC, precision-recall tradeoffs.', skill_name: 'Python', estimated_hours: 10, difficulty: 'MEDIUM' },
          { title: 'Unsupervised Clustering & Dimensionality Reduction (PCA, t-SNE, K-Means)', description: 'Implement dimensionality reduction for high-dimensional feature spaces and cluster customer data.', skill_name: 'Python', estimated_hours: 7, difficulty: 'MEDIUM' },
          { title: 'Algorithmic Optimization & Computational Complexity in ML', description: 'Analyze computational overhead of matrix multiplication and gradient descent convergence.', skill_name: 'Data Structures & Algorithms', estimated_hours: 8, difficulty: 'HARD' }
        ]
      },
      {
        step_order: 3,
        title: 'Phase 3: Deep Neural Networks, Computer Vision & LLM Architectures',
        description: 'Build neural models with PyTorch, transfer learning, and modern transformer attention mechanisms.',
        tasks: [
          { title: 'Deep Neural Networks & Backpropagation with PyTorch', description: 'Implement custom Autograd modules, activation functions, and regularization techniques.', skill_name: 'Python', estimated_hours: 12, difficulty: 'HARD' },
          { title: 'Convolutional & Transformer Architectures (Self-Attention & Embeddings)', description: 'Fine-tune pre-trained models using HuggingFace Transformers for NLP classification.', skill_name: 'Python', estimated_hours: 10, difficulty: 'HARD' },
          { title: 'Vector Databases & Retrieval-Augmented Generation (RAG)', description: 'Build semantic search pipelines using vector embeddings and cosine similarity indexing.', skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 8, difficulty: 'HARD' }
        ]
      },
      {
        step_order: 4,
        title: 'Phase 4: MLOps, Model Serving & Scalable Cloud Inference',
        description: 'Containerize models, deploy low-latency inference APIs, and monitor data drift in production.',
        tasks: [
          { title: 'FastAPI High-Throughput Inference Service & Docker Containerization', description: 'Build asynchronous RESTful model serving API with batched inference and Docker packaging.', skill_name: 'Docker & Containers', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: 'Deploy Scalable Inference on Cloud GPU/Serverless (AWS/GCP)', description: 'Deploy containerized ML pipeline to AWS SageMaker or GCP Vertex AI with auto-scaling.', skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 10, difficulty: 'HARD' },
          { title: 'Model Monitoring, Concept Drift Detection & Capstone Demonstration', description: 'Implement logging for prediction latency, input distribution drift, and end-to-end evaluation.', skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 8, difficulty: 'HARD' }
        ]
      }
    ];
  } else if (isCloud) {
    milestones = [
      {
        step_order: 1,
        title: 'Phase 1: Mathematical Foundations & Exploratory Data Analysis',
        description: 'Master Python for data engineering, linear algebra, vector calculus, and statistical hypothesis testing.',
        tasks: [
          { title: 'Vectorized Computing with NumPy & Data Wrangling with Pandas', description: 'Process multi-dimensional tensors, handle missing values, and execute grouping aggregations.', skill_name: 'Python', estimated_hours: 8, difficulty: 'EASY' },
          { title: 'Exploratory Data Analysis (EDA) & Feature Distribution Visualization', description: 'Build statistical visual pipelines using Matplotlib/Seaborn and analyze skewness and outliers.', skill_name: 'Python', estimated_hours: 6, difficulty: 'MEDIUM' },
          { title: 'Relational Analytical SQL & Window Functions for Feature Extraction', description: 'Write window functions, CTEs, and time-series rollups to prepare datasets.', skill_name: 'SQL & Relational DBs', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 2,
        title: 'Phase 2: Supervised & Unsupervised Machine Learning Algorithms',
        description: 'Implement core ML algorithms, hyperparameter tuning, and cross-validation pipelines.',
        tasks: [
          { title: 'Linear Models, Decision Trees & Ensemble Methods (Random Forest, XGBoost)', description: 'Train classification and regression models; evaluate ROC-AUC, precision-recall tradeoffs.', skill_name: 'Python', estimated_hours: 10, difficulty: 'MEDIUM' },
          { title: 'Unsupervised Clustering & Dimensionality Reduction (PCA, t-SNE, K-Means)', description: 'Implement dimensionality reduction for high-dimensional feature spaces and cluster customer data.', skill_name: 'Python', estimated_hours: 7, difficulty: 'MEDIUM' },
          { title: 'Algorithmic Optimization & Computational Complexity in ML', description: 'Analyze computational overhead of matrix multiplication and gradient descent convergence.', skill_name: 'Data Structures & Algorithms', estimated_hours: 8, difficulty: 'HARD' }
        ]
      },
      {
        step_order: 3,
        title: 'Phase 3: Deep Neural Networks, Computer Vision & LLM Architectures',
        description: 'Build neural models with PyTorch, transfer learning, and modern transformer attention mechanisms.',
        tasks: [
          { title: 'Deep Neural Networks & Backpropagation with PyTorch', description: 'Implement custom Autograd modules, activation functions, and regularization techniques.', skill_name: 'Python', estimated_hours: 12, difficulty: 'HARD' },
          { title: 'Convolutional & Transformer Architectures (Self-Attention & Embeddings)', description: 'Fine-tune pre-trained models using HuggingFace Transformers for NLP classification.', skill_name: 'Python', estimated_hours: 10, difficulty: 'HARD' },
          { title: 'Vector Databases & Retrieval-Augmented Generation (RAG)', description: 'Build semantic search pipelines using vector embeddings and cosine similarity indexing.', skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 8, difficulty: 'HARD' }
        ]
      },
      {
        step_order: 4,
        title: 'Phase 4: MLOps, Model Serving & Scalable Cloud Inference',
        description: 'Containerize models, deploy low-latency inference APIs, and monitor data drift in production.',
        tasks: [
          { title: 'FastAPI High-Throughput Inference Service & Docker Containerization', description: 'Build asynchronous RESTful model serving API with batched inference and Docker packaging.', skill_name: 'Docker & Containers', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: 'Deploy Scalable Inference on Cloud GPU/Serverless (AWS/GCP)', description: 'Deploy containerized ML pipeline to AWS SageMaker or GCP Vertex AI with auto-scaling.', skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 10, difficulty: 'HARD' },
          { title: 'Model Monitoring, Concept Drift Detection & Capstone Demonstration', description: 'Implement logging for prediction latency, input distribution drift, and end-to-end evaluation.', skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 8, difficulty: 'HARD' }
        ]
      }
    ];
  } else if (combined.includes('cloud') || combined.includes('devops') || combined.includes('sre') || combined.includes('kubernetes')) {
    milestones = [
      {
        step_order: 1,
        title: 'Phase 1: Linux Systems Architecture, Shell Automation & Networking',
        description: 'Master POSIX file systems, systemd, process scheduling, and enterprise networking protocols.',
        tasks: [
          { title: 'Linux System Administration, Bash Scripting & Process Management', description: 'Automate system maintenance, cron schedules, log rotation, and memory management in Linux.', skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 8, difficulty: 'EASY' },
          { title: 'Networking Fundamentals: TCP/IP, DNS, TLS Handshakes & Reverse Proxies', description: 'Configure NGINX reverse proxies, SSL/TLS certificates, and analyze packets with tcpdump.', skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 7, difficulty: 'MEDIUM' },
          { title: 'Automated Scripting & Tooling with Python', description: 'Write CLI automation utilities with Python for infrastructure auditing and metric collection.', skill_name: 'Python', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 2,
        title: 'Phase 2: Containerization & Microservice Lifecycle with Docker',
        description: 'Author secure multi-stage Dockerfiles, compose multi-service environments, and manage registries.',
        tasks: [
          { title: 'Production Multi-Stage Dockerfile Engineering', description: 'Optimize container layers, non-root users, build cache mounting, and secret handling.', skill_name: 'Docker & Containers', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: 'Multi-Container Orchestration with Docker Compose', description: 'Configure networking, volume persistence, and environment variable isolation for web + DB.', skill_name: 'Docker & Containers', estimated_hours: 7, difficulty: 'MEDIUM' },
          { title: 'Relational Database High Availability & Automated Backup Strategies', description: 'Implement replication topologies, automated snapshots, and connection pool tuning.', skill_name: 'SQL & Relational DBs', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 3,
        title: 'Phase 3: Kubernetes Orchestration, Ingress & Helm Packaging',
        description: 'Master pods, deployments, statefulsets, cluster networking, and Helm charts.',
        tasks: [
          { title: 'Kubernetes Workloads, ConfigMaps & Ingress Routing', description: 'Deploy self-healing applications using Deployments, Services, Ingress Controllers, and HPA.', skill_name: 'Docker & Containers', estimated_hours: 10, difficulty: 'HARD' },
          { title: 'Helm Chart Authoring & Kubernetes GitOps Secrets Management', description: 'Package microservices into reusable Helm templates with Sealed Secrets.', skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 8, difficulty: 'HARD' },
          { title: 'Distributed Systems Reliability & Algorithmic Load Balancing', description: 'Implement consistent hashing, circuit breaking, and retry backoff strategies.', skill_name: 'Data Structures & Algorithms', estimated_hours: 8, difficulty: 'HARD' }
        ]
      },
      {
        step_order: 4,
        title: 'Phase 4: Infrastructure as Code (Terraform), CI/CD & Observability',
        description: 'Provision cloud environments declaratively with Terraform, GitHub Actions, and Prometheus/Grafana.',
        tasks: [
          { title: 'Cloud Infrastructure Provisioning with Terraform on AWS/GCP', description: 'Author modular Terraform configurations for VPCs, subnets, IAM roles, and compute clusters.', skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 10, difficulty: 'HARD' },
          { title: 'Automated Multi-Stage CI/CD Pipeline with GitHub Actions', description: 'Build CI/CD workflow with linting, security vulnerability scanning, and automated release.', skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 9, difficulty: 'HARD' },
          { title: 'Observability Stack Deployment: Prometheus, Grafana & Distributed Tracing', description: 'Set up alerting thresholds, custom metrics exporters, and SLI/SLO dashboards.', skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 8, difficulty: 'HARD' }
        ]
      }
    ];
  } else if (cleanCompany || combined.includes('google') || combined.includes('amazon') || combined.includes('microsoft') || combined.includes('sde') || combined.includes('swe')) {
    const comp = cleanCompany || 'Tier-1 Tech';
    milestones = [
      {
        step_order: 1,
        title: `Phase 1: ${comp} Algorithmic Foundations & Complexity Theory`,
        description: 'Master asymptotic analysis, amortized complexity, dynamic arrays, hash tables, and two-pointer techniques.',
        tasks: [
          { title: 'Master Big-O Time & Space Complexity Analysis', description: 'Analyze recursion trees, master theorem, and memory layout of standard primitives.', skill_name: 'Data Structures & Algorithms', estimated_hours: 8, difficulty: 'EASY' },
          { title: 'Hash Tables, Frequency Counting & Two-Pointer Strategies', description: 'Solve 20 LeetCode Medium problems covering sliding window, two sum variants, and hash collisions.', skill_name: 'Data Structures & Algorithms', estimated_hours: 10, difficulty: 'MEDIUM' },
          { title: 'Core Programming Idioms & Object-Oriented Principles', description: 'Demonstrate SOLID principles and design patterns in clean code.', skill_name: 'Java', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 2,
        title: `Phase 2: Non-Linear Data Structures: Trees, Graphs & Heaps`,
        description: 'Tackle binary search trees, tries, graph traversals (DFS/BFS), Dijkstra, and topological sort.',
        tasks: [
          { title: 'Binary Trees, Lowest Common Ancestor & Tree Traversals', description: 'Implement iterative and recursive DFS/BFS traversals, path sums, and tree serialization.', skill_name: 'Data Structures & Algorithms', estimated_hours: 10, difficulty: 'MEDIUM' },
          { title: 'Graph Algorithms: Shortest Paths, Topological Sort & Disjoint Sets', description: 'Solve dependency resolution and network routing challenges with cycle detection.', skill_name: 'Data Structures & Algorithms', estimated_hours: 12, difficulty: 'HARD' },
          { title: 'Relational Database Queries & High-Throughput Storage Basics', description: 'Write ACID transactional operations and index strategies for large scale data.', skill_name: 'SQL & Relational DBs', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 3,
        title: `Phase 3: Dynamic Programming & Scalable System Design Fundamentals`,
        description: 'Formulate recursive state transitions, 1D/2D memoization, and High-Level System Architecture.',
        tasks: [
          { title: '1D & 2D Dynamic Programming Mastery (Knapsack, LCS, LIS)', description: 'Solve 15 classical dynamic programming challenges with optimal space tabulation.', skill_name: 'Data Structures & Algorithms', estimated_hours: 14, difficulty: 'HARD' },
          { title: 'High-Level System Design: Caching, Sharding & Load Balancing', description: 'Design scalable architectures (e.g. TinyURL, Twitter feed) handling 100k requests/sec.', skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 10, difficulty: 'HARD' },
          { title: 'Containerization & Microservices Decoupling with Docker', description: 'Containerize multi-tier services with health checks and stateless horizontal scaling.', skill_name: 'Docker & Containers', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 4,
        title: `Phase 4: ${comp} Behavioral Leadership & Live Coding Interview Simulation`,
        description: 'Prepare structured STAR behavioral responses, trade-off communication, and timed live mock sessions.',
        tasks: [
          { title: `${comp} Leadership Principles & Structured Behavioral Scenarios`, description: 'Draft 5 STAR stories demonstrating customer obsession, ownership, and deep diving.', skill_name: 'Professional Communication', estimated_hours: 6, difficulty: 'MEDIUM' },
          { title: 'Simulated 45-Minute Live Technical Coding Assessment', description: 'Conduct timed algorithmic rounds explaining edge cases, invariants, and complexity tradeoffs.', skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 8, difficulty: 'HARD' },
          { title: 'Collaborative Code Review & Enterprise System Documentation', description: 'Perform asynchronous pull request reviews following enterprise engineering standards.', skill_name: 'Teamwork & Collaboration', estimated_hours: 6, difficulty: 'MEDIUM' }
        ]
      }
    ];
  } else if (isWeb) {
    milestones = [
      {
        step_order: 1,
        title: 'Phase 1: Modern Reactive Frontend & Component Architecture',
        description: 'Master component life cycle, state management, reactive patterns, and accessibility.',
        tasks: [
          { title: 'Build Dynamic Reactive UI with Hooks & State Management', description: 'Implement complex state with Context API, Redux Toolkit, or Zustand with custom debounce hooks.', skill_name: 'React.js', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: 'Client-Side Routing, Route Guards & Code Splitting', description: 'Configure lazy loading, suspense boundaries, and protected authentication routing.', skill_name: 'React.js', estimated_hours: 6, difficulty: 'MEDIUM' },
          { title: 'Responsive Design & Component Styling Architecture', description: 'Design mobile-first interfaces using Tailwind CSS or modern CSS with theme support.', skill_name: 'React.js', estimated_hours: 6, difficulty: 'EASY' }
        ]
      },
      {
        step_order: 2,
        title: 'Phase 2: Scalable Backend Services & REST/GraphQL APIs',
        description: 'Architect secure, high-throughput server backends with database pooling and authentication.',
        tasks: [
          { title: 'Architect RESTful API with Express & Validation Pipeline', description: 'Implement middleware pipeline for schema validation, rate limiting, and centralized error handling.', skill_name: 'Node.js & Express', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: 'Stateless Authentication with JWT & Role-Based Access Control', description: 'Build secure token issuance, refresh rotation, and RBAC route middleware.', skill_name: 'Node.js & Express', estimated_hours: 8, difficulty: 'HARD' },
          { title: 'Relational Database Schema Design & 3NF Normalization', description: 'Model relational tables with foreign keys, composite indexes, and query transactions in MySQL.', skill_name: 'SQL & Relational DBs', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 3,
        title: 'Phase 3: High-Performance Caching, Query Optimization & Systems',
        description: 'Eliminate bottlenecks with database indexing, distributed caching, and background workers.',
        tasks: [
          { title: 'Complex Joins, Window Functions & Query Execution Plan Profiling', description: 'Optimize slow queries with EXPLAIN ANALYZE, composite indexes, and connection pools.', skill_name: 'SQL & Relational DBs', estimated_hours: 8, difficulty: 'HARD' },
          { title: 'In-Memory Caching & Session Management with Redis', description: 'Implement cache-aside pattern, TTL eviction, and distributed pub/sub event channels.', skill_name: 'Node.js & Express', estimated_hours: 7, difficulty: 'MEDIUM' },
          { title: 'Data Structures & Algorithmic Problem Solving for Web Systems', description: 'Solve 15 medium problems on Hash Tables, Two Pointers, and Binary Trees.', skill_name: 'Data Structures & Algorithms', estimated_hours: 10, difficulty: 'HARD' }
        ]
      },
      {
        step_order: 4,
        title: 'Phase 4: Containerization, Cloud CI/CD & Capstone Production Deployment',
        description: 'Deploy production-grade full-stack microservices with automated testing and continuous delivery.',
        tasks: [
          { title: 'Multi-Stage Docker Containerization for Frontend & Backend', description: 'Author optimized Dockerfiles reducing image size under 100MB with security hardening.', skill_name: 'Docker & Containers', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: 'Automated CI/CD Pipeline & Cloud Deployment on AWS/GCP', description: 'Deploy containerized services to AWS ECS or GCP Cloud Run with automated test checks.', skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 10, difficulty: 'HARD' },
          { title: 'End-to-End Capstone Verification & Mock Technical Defense', description: 'Conduct automated test suites, load testing with k6, and perform technical walkthrough.', skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 8, difficulty: 'HARD' }
        ]
      }
    ];
  } else {
    // Dynamic universal fallback tailored to user input
    milestones = [
      {
        step_order: 1,
        title: `Phase 1: Foundations & Core Principles of ${cleanRole}`,
        description: `Master fundamental technologies, syntax, development environments, and architecture for ${cleanRole}.`,
        tasks: [
          { title: `Core Tooling, Environment Setup & Workflow for ${cleanRole}`, description: `Initialize version control, developer tools, linters, and standard project templates for ${cleanRole}.`, skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 6, difficulty: 'EASY' },
          { title: `Mastery of Essential Programming Paradigms & Algorithms`, description: `Implement foundational algorithms, data manipulations, and error handling tailored to ${cleanRole}.`, skill_name: 'Data Structures & Algorithms', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: `Relational Data Modeling & Query Design`, description: `Organize domain entities and schemas with normalized relationships and indexing.`, skill_name: 'SQL & Relational DBs', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 2,
        title: `Phase 2: Core Engineering & Architecture (${focusTopics || cleanRole})`,
        description: `Deep dive into domain frameworks, practical implementation, and robust service design.`,
        tasks: [
          { title: `Implement Key Components & Domain Business Logic`, description: `Build modular, decoupled functional modules leveraging ${focusTopics || cleanRole} standards.`, skill_name: 'Node.js & Express', estimated_hours: 10, difficulty: 'MEDIUM' },
          { title: `Authentication, API Security & State Management`, description: `Implement secure communications, access control, and responsive state handling.`, skill_name: 'React.js', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: `Unit & Integration Testing with Automated Assertions`, description: `Author test suites ensuring high code coverage, regression safety, and boundary validation.`, skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 7, difficulty: 'MEDIUM' }
        ]
      },
      {
        step_order: 3,
        title: `Phase 3: Advanced Optimization, Systems & Cloud Readiness`,
        description: `Enhance system throughput, resilience, concurrency, and cloud-native practices.`,
        tasks: [
          { title: `System Profiling, Memory Optimization & Latency Reduction`, description: `Audit performance bottlenecks and optimize memory footprints and query execution paths.`, skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 9, difficulty: 'HARD' },
          { title: `Containerization with Docker & Isolated Environments`, description: `Author multi-stage Dockerfiles and container configurations for uniform deployment.`, skill_name: 'Docker & Containers', estimated_hours: 8, difficulty: 'MEDIUM' },
          { title: `Cloud Infrastructure Architecture & Cloud Services (AWS/GCP)`, description: `Deploy and configure scalable cloud resources with load balancing and storage buckets.`, skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 9, difficulty: 'HARD' }
        ]
      },
      {
        step_order: 4,
        title: `Phase 4: Capstone Engineering, Review & Industry Readiness`,
        description: `Complete a comprehensive production-grade capstone project and showcase mastery credentials.`,
        tasks: [
          { title: `End-to-End Capstone Project Implementation`, description: `Build and showcase a production-ready application demonstrating all competencies in ${cleanRole}.`, skill_name: 'Problem Solving & Critical Thinking', estimated_hours: 12, difficulty: 'HARD' },
          { title: `CI/CD Pipeline Automation & Production Monitoring`, description: `Set up automated deployment workflows and health monitoring dashboards.`, skill_name: 'Cloud Computing (AWS/GCP)', estimated_hours: 8, difficulty: 'HARD' },
          { title: `Technical Portfolio Presentation & Code Review`, description: `Prepare technical documentation, architectural diagrams, and showcase portfolio credentials.`, skill_name: 'Professional Communication', estimated_hours: 6, difficulty: 'MEDIUM' }
        ]
      }
    ];
  }

  const title = cleanCompany
    ? `${cleanCompany} - ${cleanRole} Track`
    : `${cleanRole} Mastery Roadmap`;

  const description = `A personalized, dynamic ${difficulty.toLowerCase()}-level roadmap calibrated for ${cleanRole} aspirations. Covers progressive milestones across ${focusTopics || cleanRole}, systems architecture, and industry-grade competencies over ${estimatedWeeks} weeks.`;

  return {
    title,
    description,
    milestones,
    inferredDomain: isAI
      ? 'Artificial Intelligence & Machine Learning'
      : isCloud
        ? 'Cloud Computing & DevOps'
        : isWeb
          ? 'Full Stack Web Development'
          : 'Software Engineering'
  };
}

/**
 * Dynamically generate a personalized roadmap based on user input
 */
async function generateCustomRoadmap(req, res) {
  const userId = req.user.id;
  const {
    targetRole,
    companyName = '',
    difficulty = 'INTERMEDIATE',
    estimatedWeeks = 12,
    department = 'ALL',
    domain = '',
    focusTopics = '',
    category = 'CAREER_PATH'
  } = req.body;

  if (!targetRole || !targetRole.trim()) {
    return sendError(res, 'Please provide a target role or learning goal.', 400);
  }

  try {
    const [stu] = await pool.query('SELECT id, department FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const student = stu[0];
    const studentId = student.id;

    // Fetch existing skills from DB
    const [skillsRows] = await pool.query('SELECT id, name FROM skills');
    const skillNameToId = {};
    skillsRows.forEach(s => {
      skillNameToId[s.name.toLowerCase()] = s.id;
    });

    const helperGetSkillId = (skillName) => {
      if (!skillName) return 10;
      const lower = skillName.toLowerCase();
      for (const [name, id] of Object.entries(skillNameToId)) {
        if (lower.includes(name) || name.includes(lower)) return id;
      }
      return 10; // Default to Problem Solving
    };

    // Synthesize curriculum
    const curriculum = synthesizeCurriculum(
      targetRole,
      companyName,
      difficulty,
      estimatedWeeks,
      focusTopics,
      department || student.department,
      domain
    );

    // Build target_skills JSON
    const usedSkillIds = new Set();
    curriculum.milestones.forEach(m => {
      m.tasks.forEach(t => {
        const sid = helperGetSkillId(t.skill_name);
        usedSkillIds.add(sid);
      });
    });

    const targetSkills = Array.from(usedSkillIds).slice(0, 5).map(sid => {
      const s = skillsRows.find(x => x.id === sid);
      return {
        skill_id: sid,
        skill_name: s ? s.name : 'Core Skill',
        min_score: difficulty === 'ADVANCED' ? 85 : difficulty === 'BEGINNER' ? 65 : 75
      };
    });

    const assignedCategory = companyName && companyName.trim() ? 'COMPANY_TRACK' : category;

    // Insert Roadmap Path
    const [pathResult] = await pool.query(
      `INSERT INTO roadmap_paths 
        (category, title, company_name, target_role, description, icon, difficulty, estimated_weeks, target_skills, department, domain, created_by_student_id)
       VALUES (?, ?, ?, ?, ?, 'Target', ?, ?, ?, ?, ?, ?)`,
      [
        assignedCategory,
        curriculum.title,
        companyName ? companyName.trim() : null,
        targetRole.trim(),
        curriculum.description,
        difficulty,
        parseInt(estimatedWeeks, 10) || 12,
        JSON.stringify(targetSkills),
        department || student.department || 'ALL',
        domain || curriculum.inferredDomain || 'General Engineering',
        studentId
      ]
    );

    const newRoadmapId = pathResult.insertId;

    // Insert Milestones & Tasks
    for (const milestone of curriculum.milestones) {
      const [mResult] = await pool.query(
        `INSERT INTO roadmap_milestones (roadmap_id, step_order, title, description)
         VALUES (?, ?, ?, ?)`,
        [newRoadmapId, milestone.step_order, milestone.title, milestone.description]
      );
      const newMilestoneId = mResult.insertId;

      for (const task of milestone.tasks) {
        const skillId = helperGetSkillId(task.skill_name);
        await pool.query(
          `INSERT INTO roadmap_tasks (milestone_id, title, description, skill_id, estimated_hours, difficulty)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [newMilestoneId, task.title, task.description, skillId, task.estimated_hours || 8, task.difficulty || 'MEDIUM']
        );
      }
    }

    // Log Activity
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'ROADMAP_TASK', ?, ?)`,
      [userId, `Generated Dynamic Roadmap: ${curriculum.title}`, `Created custom dynamic roadmap for ${targetRole}.`]
    );

    // Fetch and return the newly created roadmap
    req.params.id = newRoadmapId;
    return getRoadmapById(req, res);
  } catch (error) {
    console.error('[Roadmap generateCustomRoadmap Error]', error);
    return sendError(res, 'Failed to generate dynamic roadmap: ' + error.message, 500);
  }
}

/**
 * Delete a custom generated roadmap owned by the student
 */
async function deleteCustomRoadmap(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const [rows] = await pool.query('SELECT * FROM roadmap_paths WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return sendError(res, 'Roadmap not found', 404);

    if (rows[0].created_by_student_id !== studentId) {
      return sendError(res, 'You can only delete your own custom generated roadmaps', 403);
    }

    await pool.query('DELETE FROM roadmap_paths WHERE id = ?', [id]);
    return sendSuccess(res, { id: parseInt(id, 10) }, 'Custom roadmap deleted successfully');
  } catch (error) {
    console.error('[Roadmap deleteCustomRoadmap Error]', error);
    return sendError(res, 'Failed to delete roadmap: ' + error.message, 500);
  }
}

module.exports = {
  getRoadmaps,
  getRoadmapById,
  toggleTask,
  getTaskAssessment,
  submitTaskAssessment,
  generateCustomRoadmap,
  deleteCustomRoadmap
};

