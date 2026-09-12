const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * List all available assessments
 */
async function listAssessments(req, res) {
  try {
    const [assessments] = await pool.query(
      `SELECT a.*, s.name AS skill_name, sc.name AS category_name
       FROM assessments a
       JOIN skills s ON a.skill_id = s.id
       JOIN skill_categories sc ON s.category_id = sc.id
       WHERE a.is_active = TRUE
       ORDER BY a.category, a.id ASC`
    );

    return sendSuccess(res, assessments, 'Assessments retrieved successfully');
  } catch (error) {
    console.error('[Assessment listAssessments Error]', error);
    return sendError(res, 'Failed to fetch assessments', 500);
  }
}

/**
 * Get assessment details with quiz questions and options
 */
async function getAssessmentById(req, res) {
  try {
    const assessmentId = req.params.id;

    const [assessment] = await pool.query(
      `SELECT a.*, s.name AS skill_name, sc.name AS category_name
       FROM assessments a
       JOIN skills s ON a.skill_id = s.id
       JOIN skill_categories sc ON s.category_id = sc.id
       WHERE a.id = ? LIMIT 1`,
      [assessmentId]
    );

    if (assessment.length === 0) {
      return sendError(res, 'Assessment not found', 404);
    }

    // Fetch questions
    const [questions] = await pool.query(
      'SELECT id, question_text, difficulty, explanation FROM assessment_questions WHERE assessment_id = ?',
      [assessmentId]
    );

    // Fetch options for each question
    for (const q of questions) {
      const [options] = await pool.query(
        'SELECT id, option_text FROM assessment_options WHERE question_id = ?',
        [q.id]
      );
      q.options = options;
    }

    const payload = {
      ...assessment[0],
      questions
    };

    return sendSuccess(res, payload, 'Assessment quiz details retrieved');
  } catch (error) {
    console.error('[Assessment getAssessmentById Error]', error);
    return sendError(res, 'Failed to fetch assessment details', 500);
  }
}

/**
 * Submit assessment answers, compute score, update student_skills & skill_gaps
 */
async function submitAssessment(req, res) {
  const assessmentId = req.params.id;
  const { answers } = req.body; // Array of { question_id, option_id }
  const userId = req.user.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get student profile id
    const [stu] = await connection.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) {
      await connection.rollback();
      return sendError(res, 'Student profile not found', 404);
    }
    const studentId = stu[0].id;

    // Get assessment details
    const [asmntRows] = await connection.query(
      'SELECT skill_id, passing_score, category FROM assessments WHERE id = ? LIMIT 1',
      [assessmentId]
    );
    if (asmntRows.length === 0) {
      await connection.rollback();
      return sendError(res, 'Assessment not found', 404);
    }
    const { skill_id, passing_score, category } = asmntRows[0];

    // Evaluate answers
    const [questions] = await connection.query(
      'SELECT id, explanation FROM assessment_questions WHERE assessment_id = ?',
      [assessmentId]
    );

    let correctCount = 0;
    const totalQuestions = questions.length;
    const answerMap = new Map();
    (answers || []).forEach(a => answerMap.set(a.question_id, a.option_id));

    for (const q of questions) {
      const selectedOptionId = answerMap.get(q.id);
      if (selectedOptionId) {
        const [opt] = await connection.query(
          'SELECT is_correct FROM assessment_options WHERE id = ? AND question_id = ? LIMIT 1',
          [selectedOptionId, q.id]
        );
        if (opt.length > 0 && opt[0].is_correct) {
          correctCount++;
        }
      }
    }

    const calculatedScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const isPassed = calculatedScore >= passing_score;

    // Record assessment result
    await connection.query(
      `INSERT INTO assessment_results (student_id, assessment_id, score, total_questions, correct_answers, passed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, assessmentId, calculatedScore, totalQuestions, correctCount, isPassed]
    );

    // Determine proficiency level
    let level = 'BEGINNER';
    if (calculatedScore >= 85) level = 'EXPERT';
    else if (calculatedScore >= 70) level = 'ADVANCED';
    else if (calculatedScore >= 55) level = 'INTERMEDIATE';

    // Upsert into student_skills
    await connection.query(
      `INSERT INTO student_skills (student_id, skill_id, score, level, last_assessed_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE score = VALUES(score), level = VALUES(level), last_assessed_at = NOW()`,
      [studentId, skill_id, calculatedScore, level]
    );

    // Update skill_gaps
    let gapStatus = 'STRONG';
    const benchmarkRequirement = 75;
    if (calculatedScore < 55) gapStatus = 'CRITICAL_GAP';
    else if (calculatedScore < benchmarkRequirement) gapStatus = 'NEEDS_IMPROVEMENT';

    await connection.query(
      `INSERT INTO skill_gaps (student_id, skill_id, current_score, required_score, gap_status, analyzed_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE current_score = VALUES(current_score), gap_status = VALUES(gap_status), analyzed_at = NOW()`,
      [studentId, skill_id, calculatedScore, benchmarkRequirement, gapStatus]
    );

    // Recalculate student averages
    const [avgRes] = await connection.query(
      `SELECT 
        AVG(ss.score) as overall_avg,
        AVG(CASE WHEN sc.type = 'TECHNICAL' THEN ss.score ELSE NULL END) as tech_avg,
        AVG(CASE WHEN sc.type = 'SOFT_SKILL' THEN ss.score ELSE NULL END) as soft_avg
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       JOIN skill_categories sc ON s.category_id = sc.id
       WHERE ss.student_id = ?`,
      [studentId]
    );

    if (avgRes.length > 0) {
      await connection.query(
        `UPDATE student_profiles SET
          overall_skill_score = COALESCE(?, overall_skill_score),
          technical_skill_score = COALESCE(?, technical_skill_score),
          soft_skill_score = COALESCE(?, soft_skill_score)
         WHERE id = ?`,
        [
          Math.round(avgRes[0].overall_avg || calculatedScore),
          Math.round(avgRes[0].tech_avg || calculatedScore),
          Math.round(avgRes[0].soft_avg || calculatedScore),
          studentId
        ]
      );
    }

    await connection.commit();

    return sendSuccess(res, {
      score: calculatedScore,
      totalQuestions,
      correctAnswers: correctCount,
      passed: isPassed,
      level,
      gapStatus
    }, 'Assessment submitted and scored successfully');
  } catch (error) {
    await connection.rollback();
    console.error('[Assessment submitAssessment Error]', error);
    return sendError(res, 'Failed to evaluate assessment submission', 500);
  } finally {
    connection.release();
  }
}

/**
 * Get student learning recommendations based on identified skill gaps
 */
async function getLearningRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) {
      return sendError(res, 'Student profile not found', 404);
    }
    const studentId = stu[0].id;

    // Find skills where student has a gap
    const [gaps] = await pool.query(
      `SELECT skill_id, gap_status FROM skill_gaps 
       WHERE student_id = ? AND gap_status IN ('CRITICAL_GAP', 'NEEDS_IMPROVEMENT')`,
      [studentId]
    );

    const skillIds = gaps.map(g => g.skill_id);

    let recommendations = [];
    if (skillIds.length > 0) {
      const [recs] = await pool.query(
        `SELECT lp.*, s.name AS skill_name
         FROM learning_programs lp
         JOIN skills s ON lp.skill_id = s.id
         WHERE lp.skill_id IN (?)`,
        [skillIds]
      );
      recommendations = recs;
    }

    // If student has few gaps, also include popular industry tracks
    if (recommendations.length < 3) {
      const [fallback] = await pool.query(
        `SELECT lp.*, s.name AS skill_name
         FROM learning_programs lp
         LEFT JOIN skills s ON lp.skill_id = s.id
         LIMIT 4`
      );
      recommendations = fallback;
    }

    return sendSuccess(res, recommendations, 'Learning recommendations retrieved');
  } catch (error) {
    console.error('[Assessment getRecommendations Error]', error);
    return sendError(res, 'Failed to fetch recommendations', 500);
  }
}

module.exports = {
  listAssessments,
  getAssessmentById,
  submitAssessment,
  getLearningRecommendations
};
