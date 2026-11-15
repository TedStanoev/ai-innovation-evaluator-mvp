import React, { useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("e.rostova@university.edu");
  const [password, setPassword] = useState("••••••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(email);
  };

  return (
    <div className="relative min-h-screen bg-[#f1f6fc] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient Aurora Light Fields */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-28 left-1/4 w-[520px] h-[520px] rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[560px] h-[560px] rounded-full bg-emerald-200/25 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Academic Branding */}
        <div className="text-center mb-7">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-500 items-center justify-center text-white font-extrabold text-base tracking-wider shadow-[0_10px_24px_-4px_rgba(14,165,233,0.55)] mb-3">
            AIIE
          </div>
          <h1 className="text-xl font-extrabold text-[#0b1c30] tracking-tight">
            AIIE Platform
          </h1>
          <p className="text-xs font-semibold text-[#0d9488] mt-1">
            AI Innovation Evaluator
          </p>
        </div>

        {/* Login Acrylic Card */}
        <div className="rounded-3xl plate-acrylic overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-400" />
          <div className="p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-[#0b1c30] mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="login-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200/90 bg-white/90 pl-10 p-2.5 text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488] shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-bold text-[#0b1c30]"
                  >
                    Password
                  </label>
                  <a
                    href="#reset"
                    onClick={(e) => e.preventDefault()}
                    className="text-[11px] font-semibold text-[#0d9488] hover:underline"
                  >
                    Forgot credentials?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="login-password"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200/90 bg-white/90 pl-10 p-2.5 text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0d9488] shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:brightness-105 text-white font-bold text-xs border-t border-white/40 shadow-[0_8px_20px_-4px_rgba(13,148,136,0.45)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-6">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0d9488]" />
          <span>Authorized Academic Access Only</span>
        </div>
      </div>
    </div>
  );
}
