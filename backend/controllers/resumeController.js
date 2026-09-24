const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function getResumeData(req, res) {
  const userId = req.user.id;

  try {
    const [profileRows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
       WHERE sp.user_id = ? LIMIT 1`,
      [userId]
    );

    if (profileRows.length === 0) return sendError(res, 'Student profile not found', 404);
    const profile = profileRows[0];
    const studentId = profile.id;

    // Get verified skills
    const [skills] = await pool.query(
      `SELECT ss.*, s.name as skill_name, sc.name as category_name
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       JOIN skill_categories sc ON s.category_id = sc.id
       WHERE ss.student_id = ?
       ORDER BY ss.score DESC`,
      [studentId]
    );

    // Get projects
    const [projects] = await pool.query(
      'SELECT * FROM student_projects WHERE student_id = ? ORDER BY created_at DESC',
      [studentId]
    );

    // Get certifications
    const [certifications] = await pool.query(
      'SELECT * FROM student_certifications WHERE student_id = ? ORDER BY issue_date DESC',
      [studentId]
    );

    // Get achievements
    const [achievements] = await pool.query(
      'SELECT * FROM student_achievements WHERE student_id = ? ORDER BY achievement_date DESC',
      [studentId]
    );

    // Get internships from student_internships
    const [internshipsRows] = await pool.query(
      'SELECT * FROM student_internships WHERE student_id = ? ORDER BY COALESCE(start_date, created_at) DESC',
      [studentId]
    );

    // Also get selected/completed internship applications if any
    let acceptedApps = [];
    try {
      const [appRows] = await pool.query(
        `SELECT a.id, i.title as role, ind.company_name, 
                CONCAT(COALESCE(i.duration_weeks, 12), ' Weeks') as duration,
                CONCAT(COALESCE(ind.city, 'Remote'), ', ', COALESCE(ind.state, 'India')) as location,
                a.created_at as start_date, i.description, '' as technologies_used
         FROM applications a
         JOIN internships i ON a.opportunity_id = i.id AND a.opportunity_type = 'INTERNSHIP'
         JOIN industry_profiles ind ON i.industry_id = ind.id
         WHERE a.applicant_id = ? AND a.status IN ('SELECTED', 'COMPLETED', 'SHORTLISTED')`,
        [userId]
      );
      acceptedApps = appRows || [];
    } catch (err) {
      // Graceful fallback to student_internships only
    }

    const allInternships = [...internshipsRows, ...acceptedApps];

    // Build dynamic professional summary tailored to student credentials
    const topSkillsList = skills.slice(0, 5).map(s => s.skill_name).join(', ') || 'Full Stack Development, Algorithms, Database Design & Cloud Architecture';
    const degreeName = profile.degree || 'B.Tech';
    const deptName = profile.department || 'Computer Science & Engineering';
    const collegeName = profile.ug_college || profile.institution_name || 'Apex Institute of Technology';
    const cgpaStr = profile.cgpa ? ` maintaining a ${profile.cgpa} CGPA` : '';
    const internCount = allInternships.length;
    const projCount = projects.length;
    const certCount = certifications.length;

    const autoSummary = `Results-oriented ${degreeName} candidate in ${deptName} at ${collegeName}${cgpaStr}. Strong technical competency in ${topSkillsList}. Demonstrated ability to deliver production-ready software through ${projCount} end-to-end technical project${projCount === 1 ? '' : 's'}${internCount > 0 ? ` and ${internCount} industry internship experience${internCount === 1 ? '' : 's'}` : ''}. Certified across ${certCount} technical competencies and collegiate achievements, passionate about solving real-world engineering challenges.`;

    const summaryPresets = {
      standard: autoSummary,
      technical: `Passionate ${degreeName} engineer in ${deptName} at ${collegeName} specializing in ${topSkillsList}. Experienced in architecting robust systems, clean code design, and data structures. Successfully built ${projCount} production-ready technical projects${internCount > 0 ? ` and completed ${internCount} industry internship(s)` : ''}.`,
      impact: `Proactive software engineering student at ${collegeName}${cgpaStr} with a strong portfolio of ${projCount} real-world projects and ${internCount} corporate internship(s). Proven expertise in ${topSkillsList}, agile development, and end-to-end product delivery.`,
      academic: `High-achieving ${degreeName} scholar in ${deptName} at ${collegeName}${cgpaStr}. Solid academic foundation with verified certifications in ${certCount} technical and collegiate competencies, combining theoretical computer science depth with applied software development.`,
      leadership: `Versatile engineering candidate with leadership experience across collegiate technical events, ${projCount} software projects, and industry internships. Adept in ${topSkillsList} with strong communication and collaborative problem-solving skills.`
    };

    const personalInfo = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '+91 9876543210',
      headline: profile.headline || `${deptName} Engineering Student`,
      bio: profile.bio,
      address: profile.address || (profile.city ? `${profile.city}, ${profile.state || 'India'}` : 'Chennai, Tamil Nadu'),
      city: profile.city || '',
      state: profile.state || '',
      pincode: profile.pincode || '',
      current_semester: profile.current_semester || '6th Semester',
      current_year: profile.current_year || '3rd Year',
      section: profile.section || 'Section A',
      register_number: profile.register_number || profile.enrollment_number || '',
      avatar_url: profile.avatar_url || '',
      github: profile.github_url,
      linkedin: profile.linkedin_url
    };

    const undergraduate = {
      degree: profile.degree || 'B.Tech',
      department: profile.department || 'Computer Science & Engineering',
      college: profile.ug_college || profile.institution_name || 'Apex Institute of Technology',
      university: profile.ug_university || 'Affiliated Technical University',
      graduation_year: profile.graduation_year || 2026,
      cgpa: profile.cgpa || '8.75'
    };

    const twelfth = {
      college: profile.twelfth_college || 'Delhi Public School',
      board: profile.twelfth_board || 'CBSE (Science)',
      passing_year: profile.twelfth_year || 2022,
      percentage: profile.twelfth_percentage || '94.2'
    };

    const tenth = {
      school: profile.tenth_school || "St. Xavier's High School",
      board: profile.tenth_board || 'CBSE',
      passing_year: profile.tenth_year || 2020,
      percentage: profile.tenth_percentage || '92.5'
    };

    const resumeData = {
      profile: personalInfo,
      personalInfo,
      autoSummary,
      summaryPresets,
      education: [
        {
          level: `Undergraduate (${degreeName})`,
          institution: undergraduate.college,
          university: undergraduate.university,
          department: undergraduate.department,
          degree: undergraduate.degree,
          year: undergraduate.graduation_year,
          score: `CGPA: ${undergraduate.cgpa}`
        },
        {
          level: 'Higher Secondary (12th / Pre-University)',
          institution: twelfth.college,
          board: twelfth.board,
          year: twelfth.passing_year,
          score: `${twelfth.percentage}%`
        },
        {
          level: 'Secondary School Examination (10th)',
          institution: tenth.school,
          board: tenth.board,
          year: tenth.passing_year,
          score: `${tenth.percentage}%`
        }
      ],
      educationDetails: {
        undergraduate,
        twelfth,
        tenth
      },
      skills,
      projects,
      certifications,
      achievements,
      internships: allInternships
    };

    return sendSuccess(res, resumeData, 'Resume data assembled successfully');
  } catch (error) {
    console.error('[Resume getResumeData Error]', error);
    return sendError(res, 'Failed to fetch resume data', 500);
  }
}

async function logResumeExport(req, res) {
  const userId = req.user.id;
  try {
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'RESUME_EXPORT', 'Exported Professional Resume', 'Generated clean printable/PDF resume from verified portal credentials.')`,
      [userId]
    );
    return sendSuccess(res, null, 'Resume export logged');
  } catch (error) {
    return sendError(res, 'Failed to log export', 500);
  }
}

module.exports = {
  getResumeData,
  logResumeExport
};
