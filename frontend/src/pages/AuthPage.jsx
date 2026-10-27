import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Lock,
  User,
  Hash,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast, isAuthenticated } = useAuth();

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Screen modes: 'login' | 'signup' | 'otp' | 'signup_password' | 'forgot'
  const [mode, setMode] = useState(
    location.pathname === '/signup' ? 'signup' : 'login'
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');

  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotTimer, setForgotTimer] = useState(60);
  const forgotOtpRefs = [
    useRef(), useRef(), useRef(), useRef(), useRef(), useRef(),
  ];
  const [newPassword, setNewPassword] = useState('');

  const [errors, setErrors] = useState({});

  // Countdown timer for OTP screens
  useEffect(() => {
    let interval = null;
    if (mode === 'otp' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((p) => p - 1), 1000);
    } else if (mode === 'forgot' && forgotStep === 2 && forgotTimer > 0) {
      interval = setInterval(() => setForgotTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, otpTimer, forgotStep, forgotTimer]);

  // ── OTP helpers ───────────────────────────────────────────────────────────
  const handleOtpChange = (index, value, isForgot = false) => {
    if (!/^\d*$/.test(value)) return;
    const list = isForgot ? [...forgotOtp] : [...otp];
    const refs = isForgot ? forgotOtpRefs : otpRefs;
    list[index] = value.slice(-1);
    if (isForgot) setForgotOtp(list);
    else setOtp(list);
    if (value && index < 5) refs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e, isForgot = false) => {
    const list = isForgot ? forgotOtp : otp;
    const refs = isForgot ? forgotOtpRefs : otpRefs;
    if (e.key === 'Backspace' && !list[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email || !email.includes('@')) errs.email = 'Enter a valid email';
    if (!password || password.length < 4) errs.password = 'Password too short';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      const user = await login(email.trim(), password);
      setLoading(false);
      setSuccess(true);
      showToast(`Welcome back, ${user.name}!`, 'success');
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      setLoading(false);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Invalid credentials. Please try again.';
      setErrors({ form: msg });
    }
  };

  // ── Signup Step 1: send OTP ───────────────────────────────────────────────
  const handleSignupStart = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!rollNumber.trim()) errs.rollNumber = 'Roll number is required';
    if (!signupEmail || !signupEmail.includes('@'))
      errs.signupEmail = 'Enter a valid college email';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      await api.post('/auth/otp/request', { email: signupEmail.trim() });
      setLoading(false);
      setMode('otp');
      setOtp(['', '', '', '', '', '']);
      setOtpTimer(60);
      showToast(`OTP sent to ${signupEmail}!`);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setLoading(false);
      setErrors({
        form:
          err.response?.data?.detail || 'Could not send OTP. Try again.',
      });
    }
  };

  // ── Signup Step 2: verify OTP ─────────────────────────────────────────────
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) {
      setErrors({ otp: 'Enter all 6 digits' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post('/auth/otp/verify', {
        email: signupEmail.trim(),
        otp: entered,
      });
      setLoading(false);
      setMode('signup_password');
      showToast('Email verified! Set your password.');
    } catch (err) {
      setLoading(false);
      setErrors({
        otp: err.response?.data?.detail || 'Invalid OTP. Try again.',
      });
    }
  };

  // ── Signup Step 3: set password & create account ──────────────────────────
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!signupPassword || signupPassword.length < 6)
      errs.signupPassword = 'Password must be at least 6 characters';
    if (signupPassword !== signupConfirmPassword)
      errs.signupConfirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    try {
      // Register account on backend
      await api.post('/auth/register', {
        email: signupEmail.trim(),
        full_name: fullName.trim(),
        roll_number: rollNumber.trim(),
        department,
        password: signupPassword,
        otp: otp.join(''),
      });
      // Auto-login
      const user = await login(signupEmail.trim(), signupPassword);
      setLoading(false);
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#10B981', '#F5C451'],
      });
      showToast(`Welcome, ${user.name}! Account created.`);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setLoading(false);
      setErrors({
        form: err.response?.data?.detail || 'Registration failed.',
      });
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrors({ forgot: 'Enter a valid email' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await api.post('/auth/otp/request', { email: forgotEmail.trim() });
      setForgotOtp(['', '', '', '', '', '']);
      setForgotTimer(60);
      setForgotStep(2);
      setLoading(false);
      showToast(`Recovery OTP sent to ${forgotEmail}!`);
    } catch (err) {
      setLoading(false);
      setErrors({ forgot: err.response?.data?.detail || 'Could not send OTP.' });
    }
  };

  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault();
    const entered = forgotOtp.join('');
    if (entered.length < 6) {
      setErrors({ forgotOtp: 'Enter all 6 digits' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post('/auth/otp/verify', {
        email: forgotEmail.trim(),
        otp: entered,
      });
      setLoading(false);
      setForgotStep(3);
    } catch (err) {
      setLoading(false);
      setErrors({ forgotOtp: err.response?.data?.detail || 'Invalid OTP.' });
    }
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail.trim(),
        otp: forgotOtp.join(''),
        new_password: newPassword,
      });
      setLoading(false);
      showToast('Password updated! You can now log in.');
      setEmail(forgotEmail);
      setMode('login');
      setForgotStep(1);
    } catch (err) {
      setLoading(false);
      setErrors({
        newPassword: err.response?.data?.detail || 'Could not reset password.',
      });
    }
  };

  // ── OTP box component ─────────────────────────────────────────────────────
  const OtpBoxes = ({ value, onChange, onKeyDown }) => (
    <div className="flex justify-center gap-2">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={i === 0 ? otpRefs[i] : otpRefs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className={`
            w-11 h-12 text-center text-lg font-bold rounded-2xl border-2 bg-white
            transition-all duration-150 outline-none
            ${digit
              ? 'border-violet-500 text-[#0B0B0F] shadow-sm'
              : 'border-black/10 text-[#64748B]'
            }
            focus:border-violet-500 focus:ring-2 focus:ring-violet-100
          `}
        />
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* ===================== LOGIN ===================== */}
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-[10px] font-extrabold uppercase tracking-wider text-violet-700 mb-3">
                  <Sparkles className="w-3 h-3" />
                  Institutional Portal Access
                </div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#0B0B0F] tracking-tight">
                  Sign in to PlaceTrack
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter your campus credentials to access your portal.
                </p>
              </div>

              {/* Role quick-hint pills */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {[
                  { icon: ShieldCheck, label: 'Admin', color: 'violet' },
                  { icon: Briefcase, label: 'Staff (TPO)', color: 'blue' },
                  { icon: GraduationCap, label: 'Student', color: 'green' },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-${color}-50 text-${color}-700 border border-${color}-200`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                ))}
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Input
                  id="login-email"
                  label="Campus Email"
                  type="email"
                  placeholder="you@placetrack.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  error={errors.email}
                />
                <Input
                  id="login-password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                  error={errors.password}
                />

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-[#64748B]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-violet-600 w-3.5 h-3.5 rounded"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotStep(1);
                      setErrors({});
                    }}
                    className="text-violet-600 font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {errors.form && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                    {errors.form}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={success ? Check : ArrowRight}
                  loading={loading}
                  disabled={success}
                  className="w-full"
                >
                  {success ? 'Signed In!' : 'Sign In'}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-[#64748B]">
                New student?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrors({});
                  }}
                  className="text-violet-600 font-semibold hover:underline"
                >
                  Create account
                </button>
              </p>
            </motion.div>
          )}

          {/* ===================== SIGNUP STEP 1 ===================== */}
          {mode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[10px] font-extrabold uppercase tracking-wider text-green-700 mb-3">
                  <GraduationCap className="w-3 h-3" />
                  Student Registration
                </div>
                <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
                  Create your account
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Register with your college-issued email to get started.
                </p>
              </div>

              <form onSubmit={handleSignupStart} className="space-y-3.5">
                <Input
                  id="signup-name"
                  label="Full Name"
                  placeholder="Rohit Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={User}
                  error={errors.fullName}
                />
                <Input
                  id="signup-roll"
                  label="Roll Number"
                  placeholder="21CS042"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  icon={Hash}
                  error={errors.rollNumber}
                />
                <Input
                  id="signup-email"
                  label="College Email"
                  type="email"
                  placeholder="rohit@college.edu"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  icon={Mail}
                  error={errors.signupEmail}
                />
                <div>
                  <label className="block text-xs font-semibold text-[#0B0B0F] mb-1.5">
                    Department
                  </label>
                  <select
                    id="signup-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-black/10 bg-white text-sm text-[#0B0B0F] outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                  >
                    <option value="">Select Department</option>
                    {[
                      'Computer Science',
                      'Electronics & Comm.',
                      'Mechanical Engineering',
                      'Civil Engineering',
                      'Information Technology',
                      'Electrical Engineering',
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {errors.form && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                    {errors.form}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  loading={loading}
                  className="w-full"
                >
                  Send Verification OTP
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-[#64748B]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrors({}); }}
                  className="text-violet-600 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          )}

          {/* ===================== OTP VERIFICATION ===================== */}
          {mode === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrors({}); }}
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0B0B0F] mb-5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7" />
                </div>
                <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
                  Verify Your Email
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter the 6-digit code sent to{' '}
                  <strong className="text-[#0B0B0F]">{signupEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifySignupOtp} className="space-y-5">
                <OtpBoxes
                  value={otp}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                />

                {errors.otp && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-center">
                    {errors.otp}
                  </p>
                )}

                <div className="text-center text-xs text-[#64748B]">
                  {otpTimer > 0 ? (
                    <span>Resend in {otpTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        await api.post('/auth/otp/request', { email: signupEmail.trim() });
                        setOtpTimer(60);
                        showToast('New OTP sent!');
                      }}
                      className="flex items-center gap-1 mx-auto text-violet-600 font-semibold hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" /> Resend OTP
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  loading={loading}
                  className="w-full"
                >
                  Verify & Continue
                </Button>
              </form>
            </motion.div>
          )}

          {/* ===================== SET PASSWORD ===================== */}
          {mode === 'signup_password' && (
            <motion.div
              key="signup_password"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[10px] font-extrabold uppercase tracking-wider text-green-700 mb-3">
                  <Check className="w-3 h-3" />
                  Email Verified
                </div>
                <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
                  Set Your Password
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Choose a strong password to secure your account.
                </p>
              </div>

              <form onSubmit={handleCompleteSignup} className="space-y-4">
                <Input
                  id="new-password"
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  icon={Lock}
                  error={errors.signupPassword}
                />
                <Input
                  id="confirm-password"
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  icon={Lock}
                  error={errors.signupConfirmPassword}
                />

                {errors.form && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                    {errors.form}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={success ? Check : Sparkles}
                  loading={loading}
                  disabled={success}
                  className="w-full"
                >
                  {success ? 'Account Created!' : 'Create Account'}
                </Button>
              </form>
            </motion.div>
          )}

          {/* ===================== FORGOT PASSWORD ===================== */}
          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => { setMode('login'); setForgotStep(1); setErrors({}); }}
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0B0B0F] mb-5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>

              {/* Step 1: Enter email */}
              {forgotStep === 1 && (
                <>
                  <div className="mb-6">
                    <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
                      Reset Password
                    </h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      Enter your email and we'll send a recovery code.
                    </p>
                  </div>
                  <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                    <Input
                      id="forgot-email"
                      label="Campus Email"
                      type="email"
                      placeholder="you@placetrack.edu"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      icon={Mail}
                      error={errors.forgot}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      icon={ArrowRight}
                      loading={loading}
                      className="w-full"
                    >
                      Send Recovery OTP
                    </Button>
                  </form>
                </>
              )}

              {/* Step 2: Enter OTP */}
              {forgotStep === 2 && (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
                      Enter Recovery Code
                    </h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      Sent to <strong className="text-[#0B0B0F]">{forgotEmail}</strong>
                    </p>
                  </div>
                  <form onSubmit={handleForgotOtpSubmit} className="space-y-5">
                    <OtpBoxes
                      value={forgotOtp}
                      onChange={(i, v) => handleOtpChange(i, v, true)}
                      onKeyDown={(i, e) => handleOtpKeyDown(i, e, true)}
                    />
                    {errors.forgotOtp && (
                      <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-center">
                        {errors.forgotOtp}
                      </p>
                    )}
                    <div className="text-center text-xs text-[#64748B]">
                      {forgotTimer > 0 ? (
                        <span>Resend in {forgotTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            api.post('/auth/otp/request', { email: forgotEmail.trim() });
                            setForgotTimer(60);
                          }}
                          className="flex items-center gap-1 mx-auto text-violet-600 font-semibold hover:underline"
                        >
                          <RotateCcw className="w-3 h-3" /> Resend OTP
                        </button>
                      )}
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      icon={ArrowRight}
                      loading={loading}
                      className="w-full"
                    >
                      Verify Code
                    </Button>
                  </form>
                </>
              )}

              {/* Step 3: New password */}
              {forgotStep === 3 && (
                <>
                  <div className="mb-6">
                    <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
                      Set New Password
                    </h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      Choose a new secure password.
                    </p>
                  </div>
                  <form onSubmit={handleForgotResetPassword} className="space-y-4">
                    <Input
                      id="reset-password"
                      label="New Password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      icon={Lock}
                      error={errors.newPassword}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      icon={Check}
                      loading={loading}
                      className="w-full"
                    >
                      Update Password
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}
