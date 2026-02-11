"use client";

// Hooks
import { useState, useEffect } from "react";

// Routing
import { useRouter } from "next/navigation";

// Image Optimizer
import Image from "next/image";

// Icons
import { Mail, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";

// Stores
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
    if (authUser) {
      router.push("/");
    }
  }, [router, authUser]);

  const handleLogin = async (data, e) => {
    e.preventDefault();
    const isLoginSuccess = await login(data);

    if (isLoginSuccess) {
      router.push("/attendance");
    }
  };

  if (authUser) return null;

  return (
    // Note: Forced 'dark' theme on login page for design consistency.
    // Remove data-theme to respect user preference if desired.
    <div
      data-theme="lja-dark"
      className="min-h-dvh grid grid-cols-1 md:grid-cols-5 bg-base-100 text-base-content"
    >
      {/* Left Side */}
      <div className="relative hidden md:flex col-span-3 flex-col justify-center px-16">
        <Image
          className="absolute inset-0 object-cover"
          fill
          priority
          src="/images/login-background.jpg"
          alt="Login Page Background"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {/* Semantic Overlay: uses base-100 (Deep Blue) with opacity */}
        <div className="absolute top-0 inset-0 bg-base-100/90 z-0" />

        <div className="space-y-8 z-10 relative">
          <div className="p-3 bg-base-200 size-fit rounded-2xl border border-accent shadow-xl">
            <Image
              src="/images/lja-logo.webp"
              width={60}
              height={60}
              alt="LJA LOGO"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl font-bold leading-tight text-base-content">
              LJA Power
              <br />
              <span className="text-secondary">HRIS System</span>
            </h1>
          </div>

          <div className="border-l-4 border-secondary pl-6 text-base-content/80 text-lg max-w-lg leading-relaxed">
            Empowering your workforce with intelligent HR management. Seamless
            payroll, attendance tracking, and employee services.
          </div>
        </div>
      </div>

      {/* Right Side (Login Form) */}
      <div className="col-span-1 md:col-span-2 flex flex-col justify-center p-8 lg:p-12 bg-base-200 text-base-content">
        <form
          onSubmit={(e) => handleLogin(loginFormData, e)}
          className="w-full max-w-md mx-auto"
        >
          {/* Form Header */}
          <div className="space-y-2 mb-2">
            <h2 className="text-3xl font-bold">Sign In</h2>
            <p className="text-sm text-base-content/60">
              Access your LJA Power HR portal.
            </p>
          </div>

          {/* Inputs Section */}
          <div className="space-y-4">
            {/* Email Field */}
            <fieldset className="fieldset relative">
              <Mail className="absolute z-10 left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
              <legend className="fieldset-legend text-base-content/70">
                Email address
              </legend>
              <input
                value={loginFormData.email}
                onChange={(e) =>
                  setLoginFormData({ ...loginFormData, email: e.target.value })
                }
                type="email"
                // input-bordered uses base-300 for border, base-100 for bg
                className="input input-bordered w-full ps-10 bg-base-300 border-transparent focus:border-primary focus:bg-base-200 transition-colors"
                placeholder="juandelarcruz@email.com"
              />
            </fieldset>

            {/* Password Field */}
            <fieldset className="fieldset relative">
              <Lock className="absolute z-10 left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
              <legend className="fieldset-legend text-base-content/70">
                Password
              </legend>
              <input
                value={loginFormData.password}
                onChange={(e) =>
                  setLoginFormData({
                    ...loginFormData,
                    password: e.target.value,
                  })
                }
                type={hidePassword ? "password" : "text"}
                className="input input-bordered w-full ps-10 bg-base-300 border-transparent focus:border-primary focus:bg-base-200 transition-colors"
                placeholder="••••••••••••"
              />
              <button
                onClick={() => setHidePassword((prev) => !prev)}
                type="button"
                className="absolute z-10 right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition-colors"
              >
                {hidePassword ? (
                  <EyeOff className="size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-5 text-base-content/40" />
                )}
              </button>
            </fieldset>

            {/* Sign In Button */}
            <button
              type="submit"
              className="btn btn-primary w-full border-none text-primary-content text-base h-12 mt-4 shadow-lg shadow-primary/20"
            >
              {isLoggingIn ? (
                <span className="loading loading-spinner loading-md"></span>
              ) : (
                <div className="flex items-center">
                  Sign in <ArrowRight className="size-4 ml-1" />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
