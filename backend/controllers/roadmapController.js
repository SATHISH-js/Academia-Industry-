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
      WHERE 1=1
    `;
    const params = [];

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

    query += ' GROUP BY rp.id ORDER BY rp.id ASC';

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

        r.isRecommended = Boolean(deptMatch || roleMatch);
      } else {
        r.completedTasks = 0;
        r.progressPercentage = 0;
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

module.exports = {
  getRoadmaps,
  getRoadmapById,
  toggleTask,
  getTaskAssessment,
  submitTaskAssessment
};
