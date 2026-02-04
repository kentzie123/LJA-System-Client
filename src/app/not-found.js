"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, FileQuestion, Search } from "lucide-react";

const NotFoundPage = () => {
  const router = useRouter();

  return (
    // 'fixed inset-0 z-50' forces this page to float ON TOP of your Layout/TopBar
    // preventing scrollbars and ensuring a true full-screen experience.
    <div className="fixed inset-0 z-50 w-screen h-screen bg-base-200 flex items-center justify-center overflow-hidden selection:bg-primary/20">
      
      {/* --- BACKGROUND DECORATION --- */}
      {/* 1. Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>
      
      {/* 2. Soft Gradient Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-40 animate-pulse delay-1000"></div>

      {/* --- MAIN CARD --- */}
      <div className="relative z-10 max-w-lg w-full px-6">
        <div className="bg-base-100/60 backdrop-blur-xl border border-base-content/5 shadow-2xl rounded-3xl p-8 md:p-12 text-center overflow-hidden relative">
          
          {/* Watermark "404" */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] font-black text-base-content/[0.03] select-none pointer-events-none leading-none z-0">
            404
          </div>

          {/* Icon Wrapper */}
          <div className="relative z-10 flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative bg-base-100 p-4 rounded-2xl border border-base-content/10 shadow-sm">
                <FileQuestion className="size-12 text-primary" strokeWidth={1.5} />
                {/* Floating Search Icon */}
                <div className="absolute -bottom-2 -right-2 bg-base-100 rounded-full p-1.5 border border-base-content/10 shadow-sm">
                  <Search className="size-4 text-secondary" />
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="relative z-10 space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
              Page Not Found
            </h2>
            <p className="text-base-content/60 text-sm md:text-base leading-relaxed">
              We couldn't locate the file or page you are looking for. It might have been moved to a different directory or deleted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="btn btn-outline border-base-content/20 hover:border-base-content/40 hover:bg-base-content/5 text-base-content w-full sm:w-auto min-w-[140px] group"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
            
            <Link 
              href="/" 
              className="btn btn-primary w-full sm:w-auto min-w-[140px] shadow-lg shadow-primary/20 group"
            >
              <Home className="size-4" />
              Dashboard
            </Link>
          </div>

          {/* Divider & Footer */}
          <div className="relative z-10 mt-10 pt-6 border-t border-base-content/5">
            <p className="text-xs text-base-content/40 font-medium uppercase tracking-wider">
              Error Code: 404
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;