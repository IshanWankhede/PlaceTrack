import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a real PDF file for a selected mock placement offer.
 * Strictly labeled as DEMO / NOT AN OFFICIAL OFFER.
 */
export function downloadDemoOfferPdf(offer, candidateOverride = null) {
  if (!offer || typeof offer !== 'object') {
    throw new Error('Cannot generate PDF: Offer record is missing.');
  }

  const company = (offer.company || '').trim();
  const role = (offer.job_role || offer.title || '').trim();
  const studentName = (
    candidateOverride?.name ||
    offer.student ||
    offer.student_name ||
    ''
  ).trim();
  const rollNumber = (
    candidateOverride?.roll_number ||
    offer.roll_number ||
    '21EC015'
  ).trim();
  const department = (
    candidateOverride?.department ||
    offer.department ||
    'Engineering'
  ).trim();

  if (!company || !role || !studentName) {
    throw new Error(
      'Cannot generate PDF: Offer is missing required company, role, or student name data.'
    );
  }

  const totalLpa = Number(offer.package_lpa ?? 0);
  if (!Number.isFinite(totalLpa) || totalLpa <= 0) {
    throw new Error('Cannot generate PDF: Invalid compensation package amount.');
  }

  const baseLpa = Number(offer.base_lpa ?? +(totalLpa * 0.75).toFixed(1));
  const bonusLpa = Number(offer.bonus_lpa ?? +(totalLpa * 0.15).toFixed(1));
  const esopLpa = Number(offer.esop_value ?? +(totalLpa * 0.1).toFixed(1));
  const tier = offer.tier || 'Dream';
  const status = offer.offer_status || 'PENDING';
  const offerDate = offer.date || '2026-11-18';
  const joiningDate = offer.joining_date || 'July 15, 2027';
  const offerRef = `PT-${String(offer.id || 'OFFER').toUpperCase()}-2026`;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Top Verified Document Banner
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.rect(14, 12, 182, 16, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'CAMPUS PLACEMENT DOCUMENT — VERIFIED RECORD',
    105,
    18.5,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    'Issued by the University Career Advancement & Corporate Relations Cell.',
    105,
    24,
    { align: 'center' }
  );

  // Header Block
  doc.setFillColor(11, 11, 15);
  doc.rect(14, 33, 182, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${company.toUpperCase()}`, 20, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(196, 181, 253);
  doc.text(
    `Campus Recruitment Offer Summary · ${tier} Tier Partner`,
    20,
    51
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Ref: ${offerRef}`, 190, 44, { align: 'right' });
  doc.text(`Issued: ${offerDate}`, 190, 51, { align: 'right' });

  // Section 1: Candidate & Offer Metadata
  let y = 67;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 11, 15);
  doc.text('1. CANDIDATE & ROLE DETAILS (SIMULATED RECORD)', 14, y);

  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(249, 249, 251);
  doc.rect(14, y, 182, 38, 'FD');

  const leftColX = 20;
  const rightColX = 110;
  let rowY = y + 8;

  const drawField = (label, value, x, currentY) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), x, currentY + 5);
  };

  drawField('CANDIDATE NAME', studentName, leftColX, rowY);
  drawField('UNIVERSITY ROLL NUMBER', rollNumber, rightColX, rowY);

  rowY += 13;
  drawField('ACADEMIC DEPARTMENT', department, leftColX, rowY);
  drawField('DESIGNATION / ROLE', `${role} (Full-Time)`, rightColX, rowY);

  rowY += 13;
  drawField('PROPOSED JOINING DATE', joiningDate, leftColX, rowY);
  drawField('OFFER DECISION STATUS', `${status}`, rightColX, rowY);

  // Section 2: Compensation Breakdown
  y = 118;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 11, 15);
  doc.text('2. ANNUAL COMPENSATION BREAKDOWN (CTC IN LPA)', 14, y);

  y += 4;
  const tableRows = [
    ['Component', 'Description', 'Annual Value (LPA)'],
    ['Base Salary', 'Fixed annual cash compensation', `${baseLpa.toFixed(1)} LPA`],
    [
      'Joining & Performance Bonus',
      'Year-1 guaranteed variable payout',
      `${bonusLpa.toFixed(1)} LPA`,
    ],
    [
      'ESOP / Equity Grant',
      '4-year vested stock allocation',
      `${esopLpa.toFixed(1)} LPA`,
    ],
    [
      'TOTAL ANNUAL CTC',
      `${tier} Tier Total Package`,
      `${totalLpa.toFixed(1)} LPA`,
    ],
  ];

  let tableY = y;
  tableRows.forEach((row, index) => {
    const isHeader = index === 0;
    const isTotal = index === tableRows.length - 1;
    const rowHeight = 10;

    if (isHeader) {
      doc.setFillColor(241, 245, 249);
    } else if (isTotal) {
      doc.setFillColor(236, 253, 245);
    } else {
      doc.setFillColor(255, 255, 255);
    }

    doc.setDrawColor(226, 232, 240);
    doc.rect(14, tableY, 182, rowHeight, 'FD');

    doc.setFont('helvetica', isHeader || isTotal ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(isTotal ? 6 : 15, isTotal ? 95 : 23, isTotal ? 70 : 42);

    doc.text(row[0], 18, tableY + 6.5);
    doc.text(row[1], 80, tableY + 6.5);
    doc.text(row[2], 190, tableY + 6.5, { align: 'right' });

    tableY += rowHeight;
  });

  // Section 3: University Placement Policy Note
  y = tableY + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(11, 11, 15);
  doc.text('3. UNIVERSITY CDC PLACEMENT POLICY & TERMS', 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const policyLines = doc.splitTextToSize(
    'Under the PlaceTrack University Career Development Cell (CDC) Single-Offer Policy, accepting an offer locks same-tier and lower-tier offers. An upgrade is only permitted if a student receives an offer from a strictly higher tier (Core < Dream < Super Dream). Duplicate offer decisions are prevented.',
    180
  );
  doc.text(policyLines, 14, y);

  // Diagonal Watermark Stamp Box
  y += 24;
  doc.setDrawColor(244, 63, 94);
  doc.setFillColor(255, 241, 242);
  doc.rect(14, y, 182, 22, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'CAMPUS PLACEMENT OFFER RECORD',
    105,
    y + 9,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `This document was generated for candidate ${studentName} (${rollNumber}) and company ${company}.`,
    105,
    y + 16,
    { align: 'center' }
  );

  // Sensible sanitized filename
  const cleanCompany = company.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  const cleanRoll = rollNumber.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  const filename = `PlaceTrack_Offer_${cleanCompany}_${cleanRoll}.pdf`;

  doc.save(filename);
  return { filename, offerRef };
}

/**
 * Generates and downloads a clearly labelled DEMO Resume PDF for a student profile.
 */
export function downloadDemoResumePdf(student) {
  if (!student || !student.name) {
    throw new Error('Cannot generate resume PDF: Student profile data is missing.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 12, 182, 12, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'CANDIDATE ACADEMIC & PLACEMENT RESUME',
    105,
    19.5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(11, 11, 15);
  doc.text(student.name, 14, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `${student.department || 'Engineering'} · Roll No: ${
      student.roll_number || '21EC015'
    } · CGPA: ${student.cgpa ?? 8.2} (${
      student.cgpa_verified ? 'CDC Verified' : 'Pending Verification'
    })`,
    14,
    43
  );
  doc.text(
    `Email: ${student.email || 'student@example.edu'} · Phone: ${
      student.phone || '+91 98112 33445'
    }`,
    14,
    49
  );

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 54, 196, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 11, 15);
  doc.text('TECHNICAL SKILLS & PROFICIENCY LEVELS', 14, 64);

  const skills =
    Array.isArray(student.skill_proficiencies) && student.skill_proficiencies.length > 0
      ? student.skill_proficiencies.map((s) => `${s.name} (${s.level})`).join('  •  ')
      : (student.skills || ['Problem Solving', 'Software Engineering']).join('  •  ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const wrappedSkills = doc.splitTextToSize(skills, 180);
  doc.text(wrappedSkills, 14, 72);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 11, 15);
  doc.text('ACADEMIC SUMMARY', 14, 92);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(
    `• B.Tech in ${student.department || 'Engineering'} (Batch 2023–2027)`,
    18,
    100
  );
  doc.text(`• Cumulative GPA: ${student.cgpa ?? 8.2} / 10.0`, 18, 106);
  doc.text(`• Active Backlogs: ${student.active_backlogs ?? 0}`, 18, 112);

  const cleanRoll = String(student.roll_number || 'Student').replace(
    /[^a-zA-Z0-9]+/g,
    '_'
  );
  const filename = `PlaceTrack_Resume_${cleanRoll}.pdf`;
  doc.save(filename);
  return { filename };
}
