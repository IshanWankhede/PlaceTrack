import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import studentsService from '../../services/studentsService.js';
import Lanyard from '../../components/ui/Lanyard.jsx';
import { generateIdBadgeDataUrls } from '../../utils/idBadgeGenerator.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useToast } from '../../context/ToastContext.jsx';
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
  Lock,
  QrCode,
  KeyRound,
  Download,
  Radio,
} from 'lucide-react';
import { downloadDemoResumePdf } from '../../utils/offerPdfGenerator.js';
import { validatePhoneNumber } from '../../utils/interactionHelpers.js';

const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export default function ProfilePage() {
  const { user, setUser, activeRole, permissions } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [cardFinish, setCardFinish] = useState('holographic');
  const [metalFinish, setMetalFinish] = useState('silver');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const isStaffOrAdmin = activeRole === 'ADMIN' || activeRole === 'STAFF';

  const [formData, setFormData] = useState({
    name: user?.name || user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    resume_url: user?.resume_url || '',
    department: user?.department || user?.department_name || (isStaffOrAdmin ? 'Corporate Relations & TPO' : ''),
    roll_number: user?.roll_number || '',
    title: user?.title || (activeRole === 'ADMIN' ? 'CDC Director' : activeRole === 'STAFF' ? 'Placement Officer' : 'B.Tech Student'),
    cgpa: isStaffOrAdmin ? null : (user?.cgpa ?? null),
    cgpa_verified: isStaffOrAdmin ? true : (user?.cgpa_verified ?? false),
    active_backlogs: isStaffOrAdmin ? null : (user?.active_backlogs ?? 0),
    student_id: user?.student_id || null,
  });

  const [studentSkills, setStudentSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('INTERMEDIATE');

  // Load live student profile & available skills
  useEffect(() => {
    let mounted = true;

    async function fetchProfileData() {
      try {
        setLoading(true);
        const [skillsList, studentProfile] = await Promise.all([
          studentsService.getSkills().catch(() => []),
          activeRole === 'STUDENT'
            ? studentsService.getMe().catch(() => null)
            : Promise.resolve(null),
        ]);

        if (!mounted) return;
        setAvailableSkills(Array.isArray(skillsList) ? skillsList : []);

        if (skillsList.length > 0 && !selectedSkillId) {
          setSelectedSkillId(String(skillsList[0].id));
        }

        if (studentProfile) {
          setFormData({
            name: studentProfile.name,
            email: studentProfile.email,
            phone: studentProfile.phone || '',
            resume_url: studentProfile.resume_url || '',
            department: studentProfile.department_name || studentProfile.department_code || 'Engineering',
            roll_number: studentProfile.roll_number,
            title: 'B.Tech Candidate',
            cgpa: studentProfile.cgpa,
            cgpa_verified: studentProfile.cgpa_verified,
            active_backlogs: studentProfile.active_backlogs,
            student_id: studentProfile.id,
          });

          const mappedSkills = (studentProfile.skills || []).map((s) => ({
            skill_id: s.skill_id,
            name: s.skill_name,
            level: (s.proficiency_level || 'INTERMEDIATE').toUpperCase(),
          }));
          setStudentSkills(mappedSkills);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProfileData();
    return () => {
      mounted = false;
    };
  }, [activeRole]);

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

  // Save profile updates
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const phoneCheck = validatePhoneNumber(formData.phone);
    if (!phoneCheck.valid) {
      toast.warning('Invalid Phone Number', phoneCheck.reason || 'Please enter a valid phone number.');
      return;
    }

    try {
      if (activeRole === 'STUDENT') {
        await studentsService.updateMe({
          phone: phoneCheck.sanitized,
          resume_url: formData.resume_url,
        });
        toast.success('Profile Saved', 'Your contact and resume details have been updated.');
      } else {
        toast.info('Session Updated', 'Contact information updated.');
      }
      setIsEditing(false);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Update Failed', detail);
    }
  };

  // Sync skills to database
  const syncSkillsToBackend = async (nextSkills) => {
    const studentId = formData.student_id || user?.student_id;
    if (!studentId) return;

    try {
      const payload = nextSkills.map((s) => ({
        skill_id: s.skill_id,
        proficiency_level: s.level,
      }));

      await studentsService.updateStudentSkills(studentId, payload);
      setStudentSkills(nextSkills);
      toast.success('Skills Updated', 'Your technical skill proficiency matrix is updated.');
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      toast.error('Skill Sync Failed', detail);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    const skillObj = availableSkills.find((s) => String(s.id) === String(selectedSkillId));
    if (!skillObj) return;

    const exists = studentSkills.some((s) => s.skill_id === skillObj.id);
    const nextSkills = exists
      ? studentSkills.map((s) =>
          s.skill_id === skillObj.id ? { ...s, level: selectedSkillLevel } : s
        )
      : [
          ...studentSkills,
          {
            skill_id: skillObj.id,
            name: skillObj.name,
            level: selectedSkillLevel,
          },
        ];

    await syncSkillsToBackend(nextSkills);
  };

  const handleChangeSkillLevel = async (skillId, level) => {
    const nextSkills = studentSkills.map((s) =>
      s.skill_id === skillId ? { ...s, level } : s
    );
    await syncSkillsToBackend(nextSkills);
  };

  const handleRemoveSkill = async (skillId) => {
    const nextSkills = studentSkills.filter((s) => s.skill_id !== skillId);
    await syncSkillsToBackend(nextSkills);
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
            {isEditing ? 'Save Changes' : 'Edit Contact & Resume'}
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
          {/* Academic & Contact Credentials */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                    {isStaffOrAdmin ? 'Institutional Credentials' : 'Academic & Contact Credentials'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isStaffOrAdmin
                      ? 'Official administrative credentials and verified authorization record'
                      : 'CGPA, department & backlogs are locked and verified by CDC'}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified by CDC
              </span>
            </div>

            {/* Read-Only Credentials Block (Role-Scoped) */}
            {!isStaffOrAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/90 border border-black/5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      CGPA (Read-Only)
                    </span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-xl font-display font-black text-[#0B0B0F] mt-1">
                    {formData.cgpa !== null && formData.cgpa !== undefined ? `${formData.cgpa} / 10` : 'N/A'}
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
                    {formData.department || 'General Engineering'}
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
                    {formData.active_backlogs ?? 0}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Verified by CDC
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50/90 border border-black/5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      System Role
                    </span>
                    <ShieldCheck className="w-3 h-3 text-violet-600" />
                  </div>
                  <p className="text-lg font-display font-black text-[#0B0B0F] mt-1">
                    {activeRole}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Authorized Officer
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Designation
                    </span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-sm font-display font-bold text-[#0B0B0F] mt-1.5 truncate">
                    {formData.title || (activeRole === 'ADMIN' ? 'CDC Director' : 'Placement Coordinator')}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Institutional Record
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Office / Unit
                    </span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-sm font-display font-bold text-[#0B0B0F] mt-1.5 truncate">
                    {formData.department || 'Training & Placement Cell'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Career Advancement Cell
                  </span>
                </div>
              </div>
            )}

            {/* Editable Contact Fields */}
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
                      label="Resume URL"
                      value={formData.resume_url}
                      onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                      placeholder="https://..."
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
                    {formData.phone || 'Not provided'}
                  </p>
                </div>

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
                    {isStaffOrAdmin ? 'Staff Identifier' : 'Roll Number'}
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {formData.roll_number || (isStaffOrAdmin ? `STAFF-${user?.id || 'CDC'}` : 'N/A')}
                  </p>
                </div>

                {!isStaffOrAdmin && formData.resume_url && (
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                      Resume Link
                    </span>
                    <a
                      href={formData.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-violet-600 hover:underline mt-1 block truncate"
                    >
                      {formData.resume_url}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skills & Proficiency Matrix (STUDENT) */}
          {activeRole === 'STUDENT' && (
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                      Skills & Proficiency Benchmarks
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluated directly by fn_match_score against job recruitment criteria
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {studentSkills.map((item) => (
                  <div
                    key={item.skill_id}
                    className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs"
                  >
                    <span className="text-xs font-bold text-[#0B0B0F] truncate">
                      {item.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={item.level}
                        onChange={(e) => handleChangeSkillLevel(item.skill_id, e.target.value)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-[#0B0B0F] border border-black/5 outline-none"
                      >
                        {SKILL_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(item.skill_id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove skill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="pt-3 border-t border-black/5 flex items-center gap-2">
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-black/10 outline-none"
                >
                  {availableSkills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} ({sk.category})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-black/10 outline-none"
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>

                <Button variant="secondary" size="sm" type="submit" icon={Plus}>
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
