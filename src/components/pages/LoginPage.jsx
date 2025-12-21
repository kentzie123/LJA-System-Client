"use client";

// Hooks
import { useState } from "react";

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
  const { login, isLoggingIn } = useAuthStore();

  const handleLogin = async (data, e) => {
    e.preventDefault();
    const isLoginSuccess = await login(data);

    if (isLoginSuccess) {
      router.push("/");
    }
  };

  return (
    <div data-theme="dark" className="min-h-dvh grid grid-cols-1 md:grid-cols-5">
      {/* Left Side (Hidden on mobile, visible on large screens) */}
      <div className="relative hidden md:flex col-span-3 flex-col justify-center px-16">
        <Image
          className="absolute inset-0 object-cover"
          fill
          priority
          src="/images/login-background.jpg"
          alt="Login Page Background"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {/* Blue Overlay */}
        <div className="absolute top-0 inset-0 bg-[#0a1f2a]/90 z-0" />

        <div className="space-y-8 z-10 relative">
          <div className="p-3 bg-[#0f3040] size-fit rounded-2xl border border-(--panel-blue-lja)ow-xl">
            <Image
              src="/images/lja-logo.webp"
              width={60}
              height={60}
              alt="LJA LOGO"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl text-white font-bold leading-tight">
              LJA Power
              <br />
              <span className="text-(--accent-yellow-lja)">HRIS System</span>
            </h1>
          </div>

          <div className="border-l-4 border-(--accent-yellow-lja) pl-6 text-gray-300 text-lg max-w-lg leading-relaxed">
            Empowering your workforce with intelligent HR management. Seamless
            payroll, attendance tracking, and employee services.
          </div>
        </div>
      </div>

      {/* Right Side (Login Form) */}
      <div className="col-span-1 md:col-span-2 flex flex-col justify-center p-8 lg:p-12 bg-(--bg-dark-lja) text-white">
        <form
          onSubmit={(e) => handleLogin(loginFormData, e)}
          className="w-full max-w-md mx-auto"
        >
          {/* Form Header */}
          <div className="space-y-2 mb-2">
            <h2 className="text-3xl font-bold">Sign In</h2>
            <p className="text-sm text-gray-400">
              Access your LJA Power HR portal.
            </p>
          </div>

          {/* Inputs Section */}
          <div className="space-y-2">
            {/* Email Field */}
            <fieldset className="relative fieldset">
              <Mail className="absolute z-10 left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/30" />
              <legend className="fieldset-legend">Email address</legend>
              <input
                value={loginFormData.email}
                onChange={(e) =>
                  setLoginFormData({ ...loginFormData, email: e.target.value })
                }
                type="email"
                className="input ps-10 w-full"
                placeholder="juandelarcruz@email.com"
              />
            </fieldset>

            {/* Password Field */}
            <fieldset className="relative fieldset">
              <Lock className="absolute z-10 left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/30" />

              <legend className="fieldset-legend">Password</legend>
              <input
                value={loginFormData.password}
                onChange={(e) =>
                  setLoginFormData({
                    ...loginFormData,
                    password: e.target.value,
                  })
                }
                type={hidePassword ? "password" : "text"}
                className="input ps-10 w-full"
                placeholder="••••••••••••"
              />
              <button
                onClick={() => setHidePassword((prev) => !prev)}
                type="button"
                className="absolute z-10 right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {hidePassword ? (
                  <EyeOff className="size-5 text-base-content/30 " />
                ) : (
                  <Eye className="size-5 text-base-content/30 " />
                )}
              </button>
            </fieldset>

            {/* Sign In Button */}
            <button
              type="submit"
              className="btn btn-primary w-full border-none text-white text-base h-12 mt-4"
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
