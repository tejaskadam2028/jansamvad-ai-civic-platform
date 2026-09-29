import { useState } from 'react';
import {
  Building2, User, Shield, HardHat, Megaphone, ArrowRight, Mail, Lock, UserPlus,
  LogIn, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

type Mode = 'signin' | 'signup';

const roleOptions: { role: Role; title: string; icon: typeof User; color: string; ring: string }[] = [
  { role: 'citizen', title: 'Citizen', icon: User, color: 'text-blue-600', ring: 'ring-blue-500' },
  { role: 'authority', title: 'Municipal Authority', icon: Shield, color: 'text-teal-600', ring: 'ring-teal-500' },
  { role: 'workforce', title: 'Field Workforce', icon: HardHat, color: 'text-orange-600', ring: 'ring-orange-500' },
  { role: 'influencer', title: 'Influencer / Reporter', icon: Megaphone, color: 'text-fuchsia-600', ring: 'ring-fuchsia-500' },
];

export default function LoginScreen() {
  const { signIn, signUp, toast } = useStore();
  const [mode, setMode] = useState<Mode>('signin');

  // Sign In fields
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Sign Up fields
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suRole, setSuRole] = useState<Role | ''>('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!siEmail.trim() || !siPassword) {
      setError('Please enter your email and password');
      return;
    }
    const result = signIn(siEmail.trim(), siPassword);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast(`Welcome back, ${result.user.name}!`, 'success');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!suName.trim() || !suEmail.trim() || !suPassword || !suConfirm) {
      setError('Please fill in all fields');
      return;
    }
    if (suPassword !== suConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (suPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (!suRole) {
      setError('Please select a role');
      return;
    }
    const result = signUp(suName.trim(), suEmail.trim(), suPassword, suRole as Role);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess('Account created successfully! Please sign in.');
    setSuName('');
    setSuEmail('');
    setSuPassword('');
    setSuConfirm('');
    setSuRole('');
    setMode('signin');
    setSiEmail(result.account.email);
    toast('Account created! Please sign in.', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">JanSamvad</h1>
              <p className="text-sm text-gray-500">AI-Powered Municipal Corporation Platform</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Connecting citizens, authorities, field workforce, and influencers for better civic services.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </button>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} className="text-blue-600 font-medium hover:underline">
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={suName}
                    onChange={(e) => setSuName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Confirm</label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={suConfirm}
                      onChange={(e) => setSuConfirm(e.target.value)}
                      placeholder="Confirm"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Select Role</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const selected = suRole === opt.role;
                    return (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => setSuRole(opt.role)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                          selected
                            ? `border-transparent ring-2 ${opt.ring} bg-gray-50`
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${opt.color}`} />
                        {opt.title}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
              >
                Create Account <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('signin'); setError(''); setSuccess(''); }} className="text-blue-600 font-medium hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          JanSamvad uses simulated authentication for this prototype
        </p>
      </div>
    </div>
  );
}
