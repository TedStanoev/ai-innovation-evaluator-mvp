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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Academic Branding */}
        <div className="text-center mb-8">
          {/* Transparent letters with light blue outline that fill on hover */}
          <div className="inline-flex items-center justify-center mb-3 group cursor-pointer">
            <span
              className="font-black text-4xl tracking-widest select-none text-transparent transition-colors duration-200 hover:text-sky-400 group-hover:text-sky-400"
              style={{
                WebkitTextStroke: "2.5px #38bdf8",
              }}
            >
              AIIE
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Innovation Evaluator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Academic Competition Desk & Dual-Agent Assessment Engine (AIIE)
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="login-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 pl-9 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">Password</label>
                <a href="#reset" onClick={(e) => e.preventDefault()} className="text-[11px] text-blue-600 hover:underline">
                  Forgot credentials?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 pl-9 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-6">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Authorized Academic Access Only</span>
        </div>
      </div>
    </div>
  );
}
