/**
 * PlaceTrack Eligibility & Match Engine
 * Evaluates student profile against job drive criteria (CGPA, Department, Active Backlogs, and Skill Proficiencies)
 */

export const SKILL_LEVEL_RANK = {
  None: 0,
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

/**
 * Helper to get a student's proficiency level for a given skill name (case-insensitive)
 */
export function getStudentSkillLevel(student, skillName) {
  if (!student || !skillName) return null;
  const target = skillName.trim().toLowerCase();

  // Check structured skill_proficiencies array or map if present
  if (Array.isArray(student.skill_proficiencies)) {
    const found = student.skill_proficiencies.find(
      (s) => s.name?.toLowerCase() === target || s.skill?.toLowerCase() === target
    );
    if (found) return found.level;
  } else if (student.skill_proficiencies && typeof student.skill_proficiencies === 'object') {
    const key = Object.keys(student.skill_proficiencies).find(
      (k) => k.toLowerCase() === target
    );
    if (key) return student.skill_proficiencies[key];
  }

  // Check skills array (can contain objects { name, level } or plain strings)
  if (Array.isArray(student.skills)) {
    for (const item of student.skills) {
      if (typeof item === 'object' && item !== null) {
        const itemName = (item.name || item.skill || '').toLowerCase();
        if (itemName === target) {
          return item.level || 'Intermediate';
        }
      } else if (typeof item === 'string' && item.toLowerCase() === target) {
        return 'Intermediate';
      }
    }
  }

  return null;
}

/**
 * Evaluates all eligibility rules for a (student, job) pair.
 * Returns an Array of rules: [{ rule, required, actual, passed, label }]
 * Also attaches .eligible, .matchPercent, .failedRules, and .rules onto the returned array
 * for convenient consumption across UI components.
 */
export function checkEligibility(student, job) {
  if (!student || !job) {
    const empty = [];
    empty.eligible = false;
    empty.matchPercent = 0;
    empty.failedRules = [];
    empty.rules = empty;
    return empty;
  }

  const rules = [];

  // 1. CGPA Rule
  const reqCgpa = Number(job.min_cgpa ?? 0);
  const actualCgpa = Number(student.cgpa ?? 0);
  const cgpaPassed = actualCgpa >= reqCgpa;
  rules.push({
    rule: 'CGPA',
    required: `${reqCgpa.toFixed(1)}`,
    actual: `${actualCgpa.toFixed(1)}`,
    passed: cgpaPassed,
    label: `CGPA ${actualCgpa.toFixed(1)} / ${reqCgpa.toFixed(1)} ${cgpaPassed ? 'passed' : 'failed'}`,
  });

  // 2. Department / Allowed Branches Rule
  const allowedBranches =
    job.allowed_branches || job.eligible_departments || job.eligibleDepartments || [];
  const actualDept = student.department || 'Unknown';
  const deptPassed =
    allowedBranches.length === 0 || allowedBranches.includes(actualDept);
  rules.push({
    rule: 'Department',
    required: allowedBranches.length > 0 ? allowedBranches.join(', ') : 'All Branches',
    actual: actualDept,
    passed: deptPassed,
    label: `Department: ${actualDept} ${deptPassed ? 'passed' : `(need ${allowedBranches.join('/')}) failed`}`,
  });

  // 3. Active Backlogs Rule
  const maxBacklogs = Number(job.max_backlogs ?? 0);
  const actualBacklogs = Number(student.active_backlogs ?? 0);
  const backlogsPassed = actualBacklogs <= maxBacklogs;
  rules.push({
    rule: 'Active Backlogs',
    required: `max ${maxBacklogs}`,
    actual: `${actualBacklogs}`,
    passed: backlogsPassed,
    label: `Backlogs ${actualBacklogs} / max ${maxBacklogs} ${backlogsPassed ? 'passed' : 'failed'}`,
  });

  // 4. Required Skills & Proficiency Levels
  const requiredSkills = Array.isArray(job.required_skills)
    ? job.required_skills
    : Array.isArray(job.skills)
    ? job.skills.map((s) =>
        typeof s === 'object' ? s : { name: s, level: 'Intermediate' }
      )
    : [];

  let skillScoreSum = 0;

  requiredSkills.forEach((reqSkill) => {
    const skillName = reqSkill.name || reqSkill.skill || String(reqSkill);
    const reqLevel = reqSkill.level || 'Intermediate';
    const studentLevel = getStudentSkillLevel(student, skillName);

    const reqRank = SKILL_LEVEL_RANK[reqLevel] ?? 2;
    const actualRank = studentLevel ? SKILL_LEVEL_RANK[studentLevel] ?? 0 : 0;
    const skillPassed = actualRank >= reqRank;

    if (skillPassed) {
      // Bonus fraction if student exceeds required rank
      skillScoreSum += Math.min(1, 0.85 + (actualRank - reqRank) * 0.075);
    } else if (actualRank > 0) {
      skillScoreSum += (actualRank / reqRank) * 0.5;
    }

    rules.push({
      rule: skillName,
      required: reqLevel,
      actual: studentLevel || 'Unlisted',
      passed: skillPassed,
      label: `${skillName}: you ${studentLevel || 'None'}, need ${reqLevel} ${
        skillPassed ? 'passed' : 'failed'
      }`,
    });
  });

  const eligible = rules.every((r) => r.passed);
  const failedRules = rules.filter((r) => !r.passed);

  // Calculate Match % (skill match + CGPA margin)
  const skillRatio =
    requiredSkills.length > 0 ? skillScoreSum / requiredSkills.length : 1;
  const cgpaMargin = Math.max(0, Math.min(1, (actualCgpa - reqCgpa + 0.5) / 2.0));
  const backlogFactor = backlogsPassed ? 1 : 0.4;
  const deptFactor = deptPassed ? 1 : 0.4;

  const rawMatch = (skillRatio * 0.68 + cgpaMargin * 0.32) * backlogFactor * deptFactor * 100;
  const matchPercent = Math.round(Math.max(18, Math.min(99, rawMatch)));

  Object.defineProperties(rules, {
    eligible: { value: eligible, enumerable: false },
    matchPercent: { value: matchPercent, enumerable: false },
    failedRules: { value: failedRules, enumerable: false },
    rules: { value: rules, enumerable: false },
  });

  return rules;
}
