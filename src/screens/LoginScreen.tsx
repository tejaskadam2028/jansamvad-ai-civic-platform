import { useState } from 'react';
import { Building2, User, Shield, HardHat, Megaphone, ArrowRight, ArrowLeft, Mail, Lock, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getDemoUsers } from '@/lib/mockData';
import type { Role } from '@/lib/types';

const roleConfig: { role: Role; title: string; desc: string; icon: typeof User; color: string; bgColor: string; borderColor: string }[] = [
  { role: 'citizen', title: 'Citizen', desc: 'Report civic complaints and earn rewards', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', borderColor: 'border-blue-200' },
  { role: 'authority', title: 'Municipal Authority', desc: 'Verify, assign and manage complaints', icon: Shield, color: 'text-teal-600', bgColor: 'bg-teal-50 hover:bg-teal-100', borderColor: 'border-teal-200' },
  { role: 'workforce', title: 'Field Workforce', desc: 'Resolve assigned tasks in the field', icon: HardHat, color: 'text-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100', borderColor: 'border-orange-200' },
  { role: 'influencer', title: 'Influencer / Reporter', desc: 'Run campaigns and drive awareness', icon: Megaphone, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50 hover:bg-fuchsia-100', borderColor: 'border-fuchsia-200' },
];

type Step = 'landing' | 'signin' | 'role';

export default function LoginScreen() {
  const { login } = useStore();
  const demoUsers = getDemoUsers();
  const [step, setStep] = useState<Step>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('role');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">JanSamvad</h1>
              <p className="text-sm text-gray-500">AI-Powered Multimodal Municipal Corporation Platform</p>
            </div>
          </div>
          {step === 'landing' && (
            <p className="text-gray-500 max-w-xl mx-auto mt-4">
              Connecting Citizens, Municipal Authority, Field Workforce, and Influencers to improve civic complaint participation and resolution.
            </p>
          )}
        </div>

        {/* Step: Landing */}
        {step === 'landing' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Welcome to JanSamvad</h2>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Sign in to report complaints, track resolution, run campaigns, and manage civic services across Pimpri-Chinchwad.
              </p>
              <button
                onClick={() => setStep('signin')}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Demo platform — no real account needed
              </p>
            </div>
          </div>
        )}

        {/* Step: Sign In */}
        {step === 'signin' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="mb-6">
                <button
                  onClick={() => setStep('landing')}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="text-xl font-bold text-gray-900">Sign In</h2>
                <p className="text-sm text-gray-500 mt-1">Enter any email and password to continue</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Any password works"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Simulated authentication — no credentials are verified
              </p>
            </div>
          </div>
        )}

        {/* Step: Select Role */}
        {step === 'role' && (
          <>
            <div className="text-center mb-6">
              <button
                onClick={() => setStep('signin')}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-xl font-bold text-gray-900">Select Your Role</h2>
              <p className="text-sm text-gray-500 mt-1">Choose a demo account to enter its dashboard</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roleConfig.map((cfg, idx) => {
                const Icon = cfg.icon;
                const user = demoUsers[idx];
                return (
                  <button
                    key={cfg.role}
                    onClick={() => login(user)}
                    className={`group text-left p-6 rounded-2xl border-2 transition-all ${cfg.bgColor} ${cfg.borderColor} hover:shadow-lg hover:-translate-y-0.5`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-white shadow-sm ${cfg.color}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mt-4">{cfg.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{cfg.desc}</p>
                    <div className="mt-4 pt-3 border-t border-gray-200/60">
                      <p className="text-xs text-gray-400">Demo account</p>
                      <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
