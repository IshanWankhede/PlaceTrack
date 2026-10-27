/**
 * Generates crisp 1024x1400 ID badge textures for the 3D Lanyard component
 */
export function generateIdBadgeDataUrls(user, role = 'STUDENT') {
  if (typeof document === 'undefined') return { frontImage: null, backImage: null };

  const width = 800;
  const height = 1120;
  const isStaffOrAdmin = role === 'ADMIN' || role === 'STAFF';

  // --- 1. FRONT BADGE ---
  const canvasFront = document.createElement('canvas');
  canvasFront.width = width;
  canvasFront.height = height;
  const ctxF = canvasFront.getContext('2d');

  if (ctxF) {
    // Background gradient
    const bgGrad = ctxF.createLinearGradient(0, 0, width, height);
    if (role === 'ADMIN') {
      bgGrad.addColorStop(0, '#0F0F17');
      bgGrad.addColorStop(0.5, '#1A1829');
      bgGrad.addColorStop(1, '#0B0B0F');
    } else if (role === 'STAFF') {
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(0.5, '#0F2942');
      bgGrad.addColorStop(1, '#0B0B0F');
    } else {
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(0.4, '#1E1B4B');
      bgGrad.addColorStop(1, '#0B0B0F');
    }
    ctxF.fillStyle = bgGrad;
    ctxF.fillRect(0, 0, width, height);

    // Subtle holographic accent wave / cyber lines
    ctxF.save();
    ctxF.strokeStyle =
      role === 'ADMIN'
        ? 'rgba(217, 119, 6, 0.25)'
        : role === 'STAFF'
        ? 'rgba(59, 130, 246, 0.25)'
        : 'rgba(167, 139, 250, 0.25)';
    ctxF.lineWidth = 1.5;
    for (let y = 160; y < height - 160; y += 36) {
      ctxF.beginPath();
      ctxF.moveTo(30, y);
      ctxF.bezierCurveTo(width * 0.35, y + 20, width * 0.65, y - 20, width - 30, y);
      ctxF.stroke();
    }
    ctxF.restore();

    // Top Header Banner
    ctxF.fillStyle = role === 'ADMIN' ? '#F59E0B' : role === 'STAFF' ? '#3B82F6' : '#8B5CF6';
    ctxF.fillRect(0, 0, width, 18);

    // University / Platform branding
    ctxF.fillStyle = '#FFFFFF';
    ctxF.font = 'bold 32px Outfit, sans-serif';
    ctxF.fillText('PlaceTrack', 48, 70);

    ctxF.fillStyle = role === 'ADMIN' ? '#FBBF24' : role === 'STAFF' ? '#60A5FA' : '#A78BFA';
    ctxF.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctxF.fillText(
      role === 'ADMIN'
        ? 'OFFICIAL CDC DEAN & ADMIN PASS'
        : role === 'STAFF'
        ? 'OFFICIAL TPO PLACEMENT STAFF PASS'
        : 'CAMPUS PLACEMENT PASS 2025-26',
      48,
      98
    );

    // Hologram Chip Graphic
    ctxF.save();
    ctxF.translate(width - 120, 48);
    const chipGrad = ctxF.createLinearGradient(0, 0, 70, 54);
    chipGrad.addColorStop(0, '#E2E8F0');
    chipGrad.addColorStop(0.5, '#FDE047');
    chipGrad.addColorStop(1, '#A855F7');
    ctxF.fillStyle = chipGrad;
    ctxF.beginPath();
    ctxF.roundRect(0, 0, 72, 56, 8);
    ctxF.fill();
    ctxF.strokeStyle = 'rgba(0,0,0,0.3)';
    ctxF.lineWidth = 2;
    ctxF.stroke();
    // Chip contact grid
    ctxF.strokeRect(18, 0, 36, 56);
    ctxF.strokeRect(0, 18, 72, 20);
    ctxF.restore();

    // Lanyard punch hole margin guide
    ctxF.fillStyle = 'rgba(255,255,255,0.06)';
    ctxF.fillRect(width / 2 - 90, 0, 180, 40);

    // User Avatar Frame Placeholder / Glow
    const avatarY = 160;
    const avatarSize = 220;
    const avatarX = (width - avatarSize) / 2;

    ctxF.save();
    ctxF.shadowColor =
      role === 'ADMIN'
        ? 'rgba(245, 158, 11, 0.4)'
        : role === 'STAFF'
        ? 'rgba(59, 130, 246, 0.45)'
        : 'rgba(139, 92, 246, 0.5)';
    ctxF.shadowBlur = 24;
    ctxF.fillStyle = '#1E1B2E';
    ctxF.beginPath();
    ctxF.roundRect(avatarX, avatarY, avatarSize, avatarSize, 28);
    ctxF.fill();
    ctxF.lineWidth = 3;
    ctxF.strokeStyle = role === 'ADMIN' ? '#F59E0B' : role === 'STAFF' ? '#60A5FA' : '#A78BFA';
    ctxF.stroke();
    ctxF.restore();

    // Avatar Initial / Placeholder silhouette
    ctxF.fillStyle = '#FFFFFF';
    ctxF.font = 'bold 96px Outfit, sans-serif';
    ctxF.textAlign = 'center';
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'PT';
    ctxF.fillText(initials, width / 2, avatarY + 140);
    ctxF.textAlign = 'left';

    // Status pill
    ctxF.save();
    ctxF.fillStyle =
      role === 'ADMIN'
        ? 'rgba(245, 158, 11, 0.2)'
        : role === 'STAFF'
        ? 'rgba(59, 130, 246, 0.2)'
        : 'rgba(16, 185, 129, 0.2)';
    ctxF.strokeStyle = role === 'ADMIN' ? '#F59E0B' : role === 'STAFF' ? '#3B82F6' : '#10B981';
    ctxF.lineWidth = 1.5;
    const pillW = 280;
    const pillH = 34;
    const pillX = (width - pillW) / 2;
    const pillY = avatarY + avatarSize + 24;
    ctxF.beginPath();
    ctxF.roundRect(pillX, pillY, pillW, pillH, 17);
    ctxF.fill();
    ctxF.stroke();
    ctxF.fillStyle = role === 'ADMIN' ? '#FDE68A' : role === 'STAFF' ? '#BFDBFE' : '#6EE7B7';
    ctxF.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctxF.textAlign = 'center';
    ctxF.fillText(
      role === 'ADMIN'
        ? 'VERIFIED CDC ADMINISTRATOR'
        : role === 'STAFF'
        ? 'VERIFIED PLACEMENT STAFF (TPO)'
        : 'TIER-1 VERIFIED CANDIDATE',
      width / 2,
      pillY + 22
    );
    ctxF.textAlign = 'left';
    ctxF.restore();

    // Candidate Name
    ctxF.fillStyle = '#FFFFFF';
    ctxF.font = 'bold 38px Outfit, sans-serif';
    ctxF.textAlign = 'center';
    ctxF.fillText(user?.name || 'Palak Waje', width / 2, 490);

    // Department / Roll
    ctxF.fillStyle = '#94A3B8';
    ctxF.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctxF.fillText(user?.department || 'Computer Science & Engineering', width / 2, 526);

    ctxF.fillStyle = role === 'ADMIN' ? '#FBBF24' : role === 'STAFF' ? '#60A5FA' : '#C4B5FD';
    ctxF.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctxF.fillText(
      isStaffOrAdmin
        ? `STAFF ID: ${user?.roll_number || (role === 'ADMIN' ? 'CDC-DIR-001' : 'CDC-TPO-104')}`
        : `ROLL NO: ${user?.roll_number || '21CS042'}`,
      width / 2,
      558
    );
    ctxF.textAlign = 'left';

    // Metrics Bento Row on Card
    const cardInfoY = 600;
    ctxF.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctxF.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctxF.lineWidth = 1;
    ctxF.beginPath();
    ctxF.roundRect(48, cardInfoY, width - 96, 120, 20);
    ctxF.fill();
    ctxF.stroke();

    if (isStaffOrAdmin) {
      ctxF.fillStyle = '#94A3B8';
      ctxF.font = '13px "Plus Jakarta Sans", sans-serif';
      ctxF.fillText('PORTAL ACCESS', 72, cardInfoY + 40);
      ctxF.fillText('SECURITY LEVEL', 310, cardInfoY + 40);
      ctxF.fillText('CAMPUS SECTOR', 550, cardInfoY + 40);

      ctxF.fillStyle = '#FFFFFF';
      ctxF.font = 'bold 22px Outfit, sans-serif';
      ctxF.fillText(role === 'ADMIN' ? 'Super Admin' : 'TPO Staff', 72, cardInfoY + 80);
      ctxF.fillText(role === 'ADMIN' ? 'Level-5 Root' : 'Level-4 Ops', 310, cardInfoY + 80);
      ctxF.fillText(role === 'ADMIN' ? 'Central CDC' : 'TPO Desk', 550, cardInfoY + 80);
    } else {
      ctxF.fillStyle = '#94A3B8';
      ctxF.font = '13px "Plus Jakarta Sans", sans-serif';
      ctxF.fillText('ACADEMIC CGPA', 72, cardInfoY + 40);
      ctxF.fillText('ATTENDANCE', 320, cardInfoY + 40);
      ctxF.fillText('PLACEMENT STATUS', 520, cardInfoY + 40);

      ctxF.fillStyle = '#FFFFFF';
      ctxF.font = 'bold 22px Outfit, sans-serif';
      ctxF.fillText(`${user?.cgpa || '8.7'} / 10`, 72, cardInfoY + 80);
      ctxF.fillText('96.4%', 320, cardInfoY + 80);
      ctxF.fillStyle = '#10B981';
      ctxF.fillText('ELIGIBLE', 520, cardInfoY + 80);
    }

    // Barcode Graphic at bottom
    const barcodeY = 760;
    ctxF.fillStyle = '#FFFFFF';
    ctxF.font = '600 12px monospace';
    ctxF.textAlign = 'center';
    ctxF.fillText(`NFC-RFID // SEC-HASH-99841-PT2025`, width / 2, barcodeY);
    ctxF.textAlign = 'left';

    ctxF.fillStyle = '#FFFFFF';
    let bx = 60;
    while (bx < width - 60) {
      const barW = (bx % 7 === 0 || bx % 11 === 0) ? 6 : (bx % 3 === 0 ? 3 : 1.5);
      ctxF.fillRect(bx, barcodeY + 16, barW, 64);
      bx += barW + (bx % 5 === 0 ? 5 : 3);
    }

    // Bottom Footer
    ctxF.fillStyle = 'rgba(255,255,255,0.4)';
    ctxF.font = '12px "Plus Jakarta Sans", sans-serif';
    ctxF.textAlign = 'center';
    ctxF.fillText('This credential is property of PlaceTrack University Career Cell. Non-transferable.', width / 2, 880);
    ctxF.fillText('Tap card on NFC readers to check in for campus drive interview rounds.', width / 2, 904);
  }

  // --- 2. BACK BADGE ---
  const canvasBack = document.createElement('canvas');
  canvasBack.width = width;
  canvasBack.height = height;
  const ctxB = canvasBack.getContext('2d');

  if (ctxB) {
    // Back background
    ctxB.fillStyle = '#0B0B0F';
    ctxB.fillRect(0, 0, width, height);

    // Magnetic Strip
    ctxB.fillStyle = '#17171C';
    ctxB.fillRect(0, 100, width, 130);

    ctxB.fillStyle = '#33333E';
    ctxB.fillRect(0, 130, width, 70);

    // Signature strip
    ctxB.fillStyle = '#F1F5F9';
    ctxB.fillRect(48, 270, width - 96, 70);
    ctxB.fillStyle = '#64748B';
    ctxB.font = 'italic 16px "Plus Jakarta Sans", sans-serif';
    ctxB.fillText('Authorized Student / Faculty Signature Here', 64, 312);

    ctxB.fillStyle = '#0F172A';
    ctxB.font = 'bold 24px Outfit, cursive';
    ctxB.fillText(user?.name || 'Palak Waje', 540, 314);

    // Rules & Terms
    ctxB.fillStyle = '#FFFFFF';
    ctxB.font = 'bold 18px Outfit, sans-serif';
    ctxB.fillText('TERMS & PLACEMENT CODE OF CONDUCT', 48, 390);

    ctxB.fillStyle = '#94A3B8';
    ctxB.font = '14px "Plus Jakarta Sans", sans-serif';
    const rules = [
      '1. Card must be physically worn and visible during all aptitude tests, GDs, and interviews.',
      '2. Tampering with CGPA, backlog record, or clearance seals will lead to immediate debarment.',
      '3. Once an offer letter is accepted according to dream company policy, student is removed from further drives.',
      '4. Loss of badge must be reported to the CDC helpdesk within 24 hours.',
      '5. For 24/7 Placement Emergency Helpline: dial +91 (80) 4123-9000 or email support@placetrack.edu.'
    ];

    let ry = 425;
    rules.forEach(rule => {
      ctxB.fillText(rule, 48, ry, width - 96);
      ry += 32;
    });

    // QR Code generated deterministically from roll_number
    const qrY = 620;
    const qrSize = 160;
    const qrX = (width - qrSize) / 2;
    const rollSeedStr = String(user?.roll_number || '21CS042');
    let rollHash = 2166136261;
    for (let k = 0; k < rollSeedStr.length; k++) {
      rollHash ^= rollSeedStr.charCodeAt(k);
      rollHash = Math.imul(rollHash, 16777619);
    }

    ctxB.fillStyle = '#FFFFFF';
    ctxB.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    ctxB.fillStyle = '#0B0B0F';
    // Draw deterministic QR matrix seeded by roll_number
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        const isFinder =
          (i < 4 && j < 4) || (i > 11 && j < 4) || (i < 4 && j > 11);
        const bit = ((Math.abs(rollHash) + i * 31 + j * 17 + i * j) % 7) < 3;
        if (isFinder || bit) {
          ctxB.fillRect(qrX + i * 10, qrY + j * 10, 9, 9);
        }
      }
    }

    ctxB.fillStyle = '#94A3B8';
    ctxB.font = '13px monospace';
    ctxB.textAlign = 'center';
    ctxB.fillText(`QR PAYLOAD: ROLL #${rollSeedStr} · VERIFIED BY CDC`, width / 2, qrY + qrSize + 30);
    ctxB.fillText('SHA-256 DIGITAL ATTESTATION SIGNED BY CDC', width / 2, qrY + qrSize + 52);
  }

  return {
    frontImage: canvasFront.toDataURL('image/png'),
    backImage: canvasBack.toDataURL('image/png')
  };
}
