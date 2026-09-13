const { pool } = require('../config/db');
const { calculateSkillMatch } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * List all available career paths and company roadmaps
 */
async function getRoadmaps(req, res) {
  try {
    const userId = req.user?.id;
    let studentId = null;

    if (req.user?.role === 'STUDENT') {
      const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
      if (stu.length > 0) studentId = stu[0].id;
    }

    const [roadmaps] = await pool.query(
      `SELECT rp.*,
        COUNT(DISTINCT rt.id) AS total_tasks,
        COUNT(DISTINCT rm.id) AS total_milestones
       FROM roadmap_paths rp
       LEFT JOIN roadmap_milestones rm ON rp.id = rm.roadmap_id
       LEFT JOIN roadmap_tasks rt ON rm.id = rt.milestone_id
       GROUP BY rp.id
       ORDER BY rp.category, rp.id ASC`
    );

    // Calculate student task completion % if student
    for (const r of roadmaps) {
      if (studentId) {
        const [done] = await pool.query(
          `SELECT COUNT(*) AS completed_count 
           FROM student_roadmap_tasks 
           WHERE student_id = ? AND roadmap_id = ? AND is_completed = TRUE`,
          [studentId, r.id]
        );
        const completed = done[0].completed_count || 0;
        r.completedTasks = completed;
        r.progressPercentage = r.total_tasks > 0 ? Math.round((completed / r.total_tasks) * 100) : 0;
      } else {
        r.completedTasks = 0;
        r.progressPercentage = 0;
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
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

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
        `SELECT rt.*, s.name as skill_name, srt.is_completed, srt.completed_at
         FROM roadmap_tasks rt
         LEFT JOIN skills s ON rt.skill_id = s.id
         LEFT JOIN student_roadmap_tasks srt ON rt.id = srt.task_id AND srt.student_id = ?
         WHERE rt.milestone_id = ?
         ORDER BY rt.id ASC`,
        [studentId, m.id]
      );

      m.tasks = tasks.map(t => ({
        ...t,
        is_completed: Boolean(t.is_completed)
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

module.exports = {
  getRoadmaps,
  getRoadmapById,
  toggleTask
};
