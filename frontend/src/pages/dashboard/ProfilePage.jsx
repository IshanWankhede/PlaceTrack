import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { mockApi } from '../../services/mockApi.js';
import { SKILL_LEVELS } from '../../services/eligibility.js';
import Lanyard from '../../components/ui/Lanyard.jsx';
import { generateIdBadgeDataUrls } from '../../utils/idBadgeGenerator.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Sparkles,
  Edit3,
  Check,
  Plus,
  X,
  FileText,
  ExternalLink,
  Radio,
  Lock,
  QrCode,
  KeyRound,
  Download,
} from 'lucide-react';
import { downloadDemoResumePdf } from '../../utils/offerPdfGenerator.js';
import { validatePhoneNumber } from '../../utils/interactionHelpers.js';

export default function ProfilePage() {
  const { user, setUser, activeRole, permissions, showToast } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [cardFinish, setCardFinish] = useState('holographic');
  const [metalFinish, setMetalFinish] = useState('silver');

  const isStaffOrAdmin = activeRole === 'ADMIN' || activeRole === 'STAFF';

  const [formData, setFormData] = useState({
    name:
      user?.name ||
      (activeRole === 'ADMIN'
        ? 'Ishan Wankhede'
        : activeRole === 'STAFF'
        ? 'Raghav Menon'
        : 'Rohit Verma'),
    email:
      user?.email ||
      (activeRole === 'ADMIN'
        ? 'ishan.cdc@placetrack.edu'
        : activeRole === 'STAFF'
        ? 'raghav.tpo@placetrack.edu'
        : 'rohit.verma@example.edu'),
    phone: user?.phone || '+91 98112 33445',
    resume_url:
      user?.resume_url || 'https://placetrack.edu/resumes/21EC015_Rohit_Verma.pdf',
    department:
      user?.department ||
      (isStaffOrAdmin ? 'Career Advancement Cell' : 'Electronics & Comm.'),
    roll_number:
      user?.roll_number ||
      (activeRole === 'ADMIN'
        ? 'CDC-DIR-001'
        : activeRole === 'STAFF'
        ? 'CDC-TPO-014'
        : '21EC015'),
    title:
      user?.title ||
      (activeRole === 'ADMIN'
        ? 'Dean of Corporate Relations'
        : activeRole === 'STAFF'
        ? 'Senior Placement Coordinator (TPO)'
        : 'B.Tech Final Year Candidate'),
    cgpa: user?.cgpa ?? 8.2,
    cgpa_verified: user?.cgpa_verified ?? true,
    active_backlogs: user?.active_backlogs ?? 0,
  });

  const [skillProficiencies, setSkillProficiencies] = useState(
    user?.skill_proficiencies || [
      { name: 'C++', level: 'Advanced' },
      { name: 'Embedded C', level: 'Advanced' },
      { name: 'RTOS', level: 'Intermediate' },
      { name: 'Python', level: 'Advanced' },
      { name: 'Docker', level: 'Advanced' },
    ]
  );

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // Sync when activeRole or user changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name:
        user?.name ||
        (activeRole === 'ADMIN'
          ? 'Ishan Wankhede'
          : activeRole === 'STAFF'
          ? 'Raghav Menon'
          : 'Rohit Verma'),
      email:
        user?.email ||
        (activeRole === 'ADMIN'
          ? 'ishan.cdc@placetrack.edu'
          : activeRole === 'STAFF'
          ? 'raghav.tpo@placetrack.edu'
          : 'rohit.verma@example.edu'),
      phone: user?.phone || prev.phone,
      resume_url: user?.resume_url || prev.resume_url,
      department:
        user?.department ||
        (isStaffOrAdmin ? 'Career Advancement Cell' : 'Electronics & Comm.'),
      roll_number:
        user?.roll_number ||
        (activeRole === 'ADMIN'
          ? 'CDC-DIR-001'
          : activeRole === 'STAFF'
          ? 'CDC-TPO-014'
          : '21EC015'),
      title:
        user?.title ||
        (activeRole === 'ADMIN'
          ? 'Dean of Corporate Relations'
          : activeRole === 'STAFF'
          ? 'Senior Placement Coordinator (TPO)'
          : 'B.Tech Final Year Candidate'),
      cgpa: user?.cgpa ?? 8.2,
      cgpa_verified: user?.cgpa_verified ?? true,
      active_backlogs: user?.active_backlogs ?? 0,
    }));
    if (user?.skill_proficiencies) {
      setSkillProficiencies(user.skill_proficiencies);
    }
  }, [user, activeRole, isStaffOrAdmin]);

  // Dynamically generate ID card textures with QR derived from roll_number
  const badgeTextures = useMemo(() => {
    return generateIdBadgeDataUrls(
      {
        name: formData.name,
        roll_number: formData.roll_number,
        department: formData.department,
        cgpa: formData.cgpa,
      },
      activeRole
    );
  }, [formData.name, formData.roll_number, formData.department, formData.cgpa, activeRole]);

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const phoneCheck = validatePhoneNumber(formData.phone);
    if (!phoneCheck.valid) {
      showToast(phoneCheck.reason || 'Please enter a valid phone number.');
      return;
    }
    const updatedPayload = {
      name: formData.name,
      email: formData.email,
      phone: phoneCheck.sanitized,
      resume_url: formData.resume_url,
      ...(activeRole === 'STUDENT'
        ? {
            skill_proficiencies: skillProficiencies,
            skills: skillProficiencies.map((s) => s.name),
          }
        : {}),
    };
    if (activeRole === 'STUDENT') {
      await mockApi.updateStudentProfile(user?.id || 'student-rohit', updatedPayload);
    } else {
      await mockApi.updateUserAccount(user?.id, activeRole, updatedPayload);
    }
    setUser((prev) => ({
      ...prev,
      ...updatedPayload,
    }));
    setIsEditing(false);
    showToast('Profile contact details saved');
  };

  const syncSkillsToStore = async (nextSkills) => {
    setSkillProficiencies(nextSkills);
    await mockApi.updateStudentSkills(user?.id || 'student-rohit', nextSkills);
    setUser((prev) => ({
      ...prev,
      skill_proficiencies: nextSkills,
      skills: nextSkills.map((s) => s.name),
    }));
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    const exists = skillProficiencies.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    const nextSkills = exists
      ? skillProficiencies.map((s) =>
          s.name.toLowerCase() === trimmed.toLowerCase()
            ? { ...s, level: newSkillLevel }
            : s
        )
      : [...skillProficiencies, { name: trimmed, level: newSkillLevel }];

    await syncSkillsToStore(nextSkills);
    setNewSkillName('');
    showToast(`Saved ${trimmed} (${newSkillLevel})`);
  };

  const handleChangeSkillLevel = async (skillName, level) => {
    const nextSkills = skillProficiencies.map((s) =>
      s.name === skillName ? { ...s, level } : s
    );
    await syncSkillsToStore(nextSkills);
    showToast(`Updated ${skillName} proficiency to ${level}`);
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const nextSkills = skillProficiencies.filter((s) => s.name !== skillToRemove);
    await syncSkillsToStore(nextSkills);
    showToast(`Removed ${skillToRemove}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B0B0F] text-white flex items-center justify-center font-display font-black text-xl shadow-md flex-shrink-0">
            {formData.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#0B0B0F] tracking-tight">
                {formData.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified by CDC
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800">
                Role: {activeRole}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              {formData.title} • {formData.department} • ID: {formData.roll_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isEditing ? 'primary' : 'outline'}
            icon={isEditing ? Check : Edit3}
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing
              ? 'Save Changes'
              : isStaffOrAdmin
              ? 'Edit Contact Details'
              : 'Edit Contact & Resume'}
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 3D INTERACTIVE LANYARD ID CARD WITH ROLL NUMBER QR */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/60 shadow-lg relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 z-10 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  3D Digital ID Card
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 bg-black/5 px-2.5 py-1 rounded-full flex items-center gap-1">
                <QrCode className="w-3 h-3 text-violet-600" />
                QR: {formData.roll_number}
              </span>
            </div>

            <div className="w-full h-[520px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100/40 to-slate-200/20 border border-black/5 flex items-center justify-center">
              {badgeTextures.frontImage && (
                <Lanyard
                  frontImage={badgeTextures.frontImage}
                  backImage={badgeTextures.backImage}
                  cardColor="#0F172A"
                  finish={cardFinish}
                  metal={metalFinish}
                  strapColor="#0B0B0F"
                  interactive={true}
                  intro={true}
                  gravity={0.9}
                  damping={0.5}
                  elasticity={0.5}
                  breeze={0.4}
                />
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-white/90 font-medium whitespace-nowrap shadow-sm">
                Click card to flip for QR • Drag to swing
              </div>
            </div>

            {/* Customizer controls */}
            <div className="w-full mt-4 pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Card Finish:</span>
                <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
                  {['holographic', 'glossy', 'metallic'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setCardFinish(f)}
                      className={`px-2 py-0.5 rounded-lg capitalize font-medium transition-all ${
                        cardFinish === f
                          ? 'bg-white text-black shadow-xs font-bold'
                          : 'text-slate-500 hover:text-black'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Clip:</span>
                <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
                  {['silver', 'gold', 'graphite'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetalFinish(m)}
                      className={`px-2 py-0.5 rounded-lg capitalize font-medium transition-all ${
                        metalFinish === m
                          ? 'bg-white text-black shadow-xs font-bold'
                          : 'text-slate-500 hover:text-black'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full mt-3 p-3 bg-slate-50/80 rounded-2xl border border-black/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Radio className="w-4 h-4 text-violet-600" />
                <span>
                  QR Encoded: <strong className="text-slate-800">{formData.roll_number}</strong>
                </span>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                PASS #PT-{formData.roll_number}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Role-Specific Credentials + Editable Contact */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                    {isStaffOrAdmin
                      ? `${activeRole} Institutional Credentials`
                      : 'Academic & Contact Credentials'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isStaffOrAdmin
                      ? 'Verified Campus Placement Cell staff identity and role permissions'
                      : 'CGPA, department & backlogs are locked and verified by CDC'}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified by CDC
              </span>
            </div>

            {isStaffOrAdmin ? (
              /* ADMIN / STAFF INSTITUTIONAL BLOCK */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/90 border border-black/5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Role Classification
                  </span>
                  <p className="text-base font-display font-black text-[#0B0B0F] mt-1">
                    {permissions?.label || activeRole}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 mt-1">
                    ID: {user?.id}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Designation
                  </span>
                  <p className="text-sm font-display font-bold text-[#0B0B0F] mt-1">
                    {formData.title}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    {formData.department}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Employee Badge ID
                  </span>
                  <p className="text-base font-mono font-black text-emerald-600 mt-1">
                    {formData.roll_number}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Active Clearance
                  </span>
                </div>
              </div>
            ) : (
              /* STUDENT READ-ONLY CDC VERIFIED ACADEMIC BLOCK */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/90 border border-black/5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      CGPA (Read-Only)
                    </span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-xl font-display font-black text-[#0B0B0F] mt-1">
                    {formData.cgpa} / 10
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Verified by CDC
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Department (Read-Only)
                    </span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-sm font-display font-bold text-[#0B0B0F] mt-1.5">
                    {formData.department}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Verified by CDC
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Active Backlogs (Read-Only)
                    </span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-xl font-display font-black text-emerald-600 mt-1">
                    {formData.active_backlogs}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Verified by CDC
                  </span>
                </div>
              </div>
            )}

            {/* Editable Contact Phone & Resume Link */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                  {!isStaffOrAdmin && (
                    <Input
                      label="Resume Link (URL)"
                      value={formData.resume_url}
                      onChange={(e) =>
                        setFormData({ ...formData, resume_url: e.target.value })
                      }
                      placeholder="https://drive.google.com/..."
                      required
                    />
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Contact Phone
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-violet-600" />
                    {formData.phone}
                  </p>
                </div>

                {!isStaffOrAdmin && (
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                      Candidate Resume
                    </span>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const res = downloadDemoResumePdf({
                            ...user,
                            ...formData,
                            skill_proficiencies: skillProficiencies,
                          });
                          if (res.success) {
                            showToast(`Downloaded Resume PDF (${res.filename})`);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs border border-violet-200 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Resume PDF
                      </button>
                      <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {formData.resume_url}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Institutional Email
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {formData.email}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    {isStaffOrAdmin ? 'Staff Badge ID' : 'Roll Number'}
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {formData.roll_number}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. For STUDENT: Editable Skills + Proficiency Matrix; For ADMIN/STAFF: Role Permissions Matrix */}
          {isStaffOrAdmin ? (
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                    Active Role Permissions ({activeRole})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enforced by centralized frontend route guards and component capability checks
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(user?.permissions || []).map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/90 border border-slate-200/80 text-xs font-bold text-[#0B0B0F]"
                  >
                    <span className="font-mono">{perm}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Granted
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                      Skills & Proficiency Matrix (Beginner to Expert)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Used directly by the Eligibility Engine to evaluate drive qualification & Match %
                    </p>
                  </div>
                </div>
              </div>

              {/* Editable Skills List with Level Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {skillProficiencies.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs"
                  >
                    <span className="text-xs font-bold text-[#0B0B0F] truncate">
                      {item.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={item.level}
                        onChange={(e) => handleChangeSkillLevel(item.name, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                          item.level === 'Expert'
                            ? 'bg-violet-100 text-violet-800 border-violet-200'
                            : item.level === 'Advanced'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.level === 'Intermediate'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {SKILL_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(item.name)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove skill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Skill + Proficiency Form */}
              <form
                onSubmit={handleAddSkill}
                className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 border-t border-black/5"
              >
                <input
                  type="text"
                  placeholder="Skill name (e.g. Python, PyTorch, Rust)..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 min-w-[180px] px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-violet-500"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-[#0B0B0F] outline-none"
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <Button size="sm" variant="primary" icon={Plus} type="submit">
                  Add Skill
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
