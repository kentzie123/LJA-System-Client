"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const LoginPage = () => {
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const [hidePassword, setHidePassword] = useState(true);
  const { login, isLoggingIn, authUser } = useAuthStore();

  useEffect(() => {
    if (authUser) router.push("/");
  }, [router, authUser]);

  const handleLogin = async (data, e) => {
    e.preventDefault();
    const isLoginSuccess = await login(data);
    if (isLoginSuccess) router.push("/");
  };

  if (authUser) return null;

  return (
    <div
      data-theme="lja-dark"
      className="min-h-dvh grid grid-cols-1 md:grid-cols-5 bg-base-100 text-base-content font-sans antialiased"
    >
      {/* --- LEFT SIDE: Command Center Hero --- */}
      <div className="relative hidden md:flex col-span-3 flex-col justify-between p-16 border-r border-white/10 overflow-hidden">
        <Image
          className="absolute inset-0 object-cover opacity-30 grayscale"
          fill
          priority
          src="/images/login-background.jpg"
          alt="lja hris system background"
          sizes="60vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-base-100 z-0" />

        {/* Branding */}
        <div className="z-10 relative flex items-center gap-4">
          <Image
            src="/images/lja-logo.webp"
            width={46}
            height={46}
            alt="LJA Logo"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-black uppercase tracking-[.25em] leading-none text-white">
              LJA Power
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[.4em] text-secondary mt-1">
              Limited Co
            </span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-6 z-10 relative">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black leading-none uppercase tracking-tighter text-white">
              LJA Power <br />
              <span className="text-primary">HR Portal</span>
            </h1>
            {/* Simple secondary accent line */}
            <div className="h-1.5 w-20 bg-secondary mt-4" />
          </div>

          <p className="text-base-content/70 text-lg max-w-md leading-relaxed font-medium">
            Managing our workforce with reliability and precision. Access your
            payroll, attendance, and employee services in one place.
          </p>
        </div>

        {/* Technical Status Footer */}
        <div className="z-10 relative flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-30">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-success animate-pulse" />
            <span>Terminal: Secure</span>
          </div>
          <span>v1.0.0-stable</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* --- RIGHT SIDE: Security Authentication --- */}
      <div className="col-span-1 md:col-span-2 flex flex-col justify-center p-6 sm:p-12 lg:p-20 bg-base-200 border-l border-black/20">
        <div className="w-full max-w-sm mx-auto">
          {/* MOBILE HEADER: Clean & Rugged */}
          <div className="md:hidden flex flex-col items-center mb-12 text-center">
            <Image
              className="pb-3"
              src="/images/lja-logo.webp"
              width={56}
              height={56}
              alt="LJA Logo"
            />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
              LJA <span className="text-primary">POWER</span>
            </h1>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary opacity-80 mt-2">
              HRIS Gateway
            </span>
          </div>

          {/* AUTH FORM */}
          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tight text-white">
                Sign In
              </h2>
              <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-[0.2em]">
                Authorized Personnel Access
              </p>
            </div>

            <form
              onSubmit={(e) => handleLogin(loginFormData, e)}
              className="space-y-6"
            >
              {/* Identity Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-content opacity-50 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="z-1 absolute left-4 top-1/2 -translate-y-1/2 size-5 text-base-content/20 group-focus-within:text-primary transition-colors" />
                  <input
                    value={loginFormData.email}
                    onChange={(e) =>
                      setLoginFormData({
                        ...loginFormData,
                        email: e.target.value,
                      })
                    }
                    type="email"
                    className="input input-bordered w-full ps-12 rounded-none bg-base-300 border-2 border-transparent focus:border-primary transition-all font-medium text-sm tabular-nums"
                    placeholder="name@gmail.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-end ml-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-content opacity-50">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="z-1 absolute left-4 top-1/2 -translate-y-1/2 size-5 text-base-content/20 group-focus-within:text-primary transition-colors" />
                  <input
                    value={loginFormData.password}
                    onChange={(e) =>
                      setLoginFormData({
                        ...loginFormData,
                        password: e.target.value,
                      })
                    }
                    type={hidePassword ? "password" : "text"}
                    className="input input-bordered w-full ps-12 rounded-none bg-base-300 border-2 border-transparent focus:border-primary transition-all font-medium text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    onClick={() => setHidePassword((prev) => !prev)}
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity"
                  >
                    {hidePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Heavy Action Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn btn-primary w-full rounded-none h-14 border-none text-white font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all"
              >
                {isLoggingIn ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <div className="flex items-center gap-3">
                    Verify Identity <ArrowRight size={20} />
                  </div>
                )}
              </button>
            </form>

            {/* Support Info */}
            <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-20">
                <ShieldCheck size={14} />
                End-to-End Encryption Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
