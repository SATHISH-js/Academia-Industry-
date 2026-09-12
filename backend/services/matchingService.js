/**
 * Reusable Matching Service
 * Calculates compatibility score between candidate skills and opportunity skill requirements
 */

function calculateSkillMatch(studentSkills = [], requiredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchScore: 100,
      matchedSkills: [],
      missingSkills: [],
      skillGaps: []
    };
  }

  // Map student skills by skill_id
  const studentSkillMap = new Map();
  studentSkills.forEach((s) => {
    studentSkillMap.set(s.skill_id, {
      name: s.skill_name || s.name,
      score: Number(s.score) || 0,
      level: s.level
    });
  });

  let totalWeightedScore = 0;
  let totalWeight = 0;

  const matchedSkills = [];
  const missingSkills = [];
  const skillGaps = [];

  requiredSkills.forEach((reqSkill) => {
    const skillId = reqSkill.skill_id;
    const minRequired = Number(reqSkill.min_required_score) || 70;
    const weight = reqSkill.is_mandatory ? 2 : 1;
    totalWeight += weight;

    const studentSkill = studentSkillMap.get(skillId);

    if (!studentSkill) {
      // Student has not taken this assessment
      missingSkills.push({
        skill_id: skillId,
        skill_name: reqSkill.skill_name || reqSkill.name,
        min_required: minRequired,
        current_score: 0
      });
      // Contributes 0 to score
    } else {
      const studentScore = studentSkill.score;
      // Ratio capped at 100%
      const skillFulfillment = Math.min(100, Math.round((studentScore / minRequired) * 100));
      totalWeightedScore += skillFulfillment * weight;

      if (studentScore >= minRequired) {
        matchedSkills.push({
          skill_id: skillId,
          skill_name: reqSkill.skill_name || reqSkill.name,
          current_score: studentScore,
          min_required: minRequired
        });
      } else {
        skillGaps.push({
          skill_id: skillId,
          skill_name: reqSkill.skill_name || reqSkill.name,
          current_score: studentScore,
          min_required: minRequired,
          gap: minRequired - studentScore
        });
      }
    }
  });

  const finalMatchScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  return {
    matchScore: finalMatchScore,
    matchedSkills,
    missingSkills,
    skillGaps
  };
}

module.exports = {
  calculateSkillMatch
};
