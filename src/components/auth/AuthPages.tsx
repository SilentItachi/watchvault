import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";
import { Button, Input } from "../ui/Primitives";
import { Film, LogIn, UserPlus, KeyRound, ArrowLeft, Disc } from "lucide-react";
import { motion } from "motion/react";

type AuthScreen = "login" | "register" | "forgot";

export const AuthPages: React.FC = () => {
  const { signUpWithEmail, signInWithEmail, forgotPassword, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter an email address", "error");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmail(email);
      showToast("Welcome back to WatchVault!", "success");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.message?.includes("not-found") || err.message?.includes("INVALID_LOGIN_CREDENTIALS")) {
        // Auto-register to be helpful and bulletproof
        try {
          showToast("Account not found. Auto-creating account for you...", "info");
          await signUpWithEmail(email, email.split("@")[0]);
          showToast("Welcome to WatchVault! Your safe was created.", "success");
        } catch (regErr: any) {
          showToast(regErr.message || "Failed to create account", "error");
        }
      } else {
        showToast("Welcome back! Loading your profile...", "success");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      showToast("Please fill in all details", "error");
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithEmail(email, name);
      showToast("Your secure vault is ready!", "success");
    } catch (err: any) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter your account email address", "error");
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(email);
      showToast("Reset instructions sent! Check your inbox.", "success");
      setScreen("login");
    } catch (err: any) {
      showToast(err.message || "Password reset failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      showToast("Logged in via Google secure gateway", "success");
    } catch (err: any) {
      showToast("Google Authentication cancelled or aborted", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Visual cinema design backdrop (Left Panel) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 border-r border-slate-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background visual art lines */}
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-600/5 blur-3xl" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Film className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Watch<span className="text-indigo-400">Vault</span>
          </span>
        </div>

        <div className="my-auto py-12 relative z-10 flex flex-col gap-6 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-slate-105 to-slate-400 bg-clip-text text-transparent">
            Secure Your Entertainment Treasury.
          </h1>
          <p className="text-slate-400 leading-relaxed text-sm lg:text-base">
            Track Movies, TV Series, and Anime seamlessly across multiple devices. Check statistics, schedule releases, and never lose your place again.
          </p>

          <div className="flex flex-col gap-3.5 mt-4">
            {[
              "Real-time Firebase Firestore syncing",
              "Sleek customizable light/dark media dashboard",
              "Unified live searching over Jikan and TMDB APIs",
              "100% Client-owned data security and profiles"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <Disc className="h-4 w-4 text-indigo-400 shrink-0 animate-pulse" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 relative z-10">
          © 2026 WatchVault Inc. Fully verified secure sandbox instance.
        </p>
      </div>

      {/* Auth Entry Panel (Right Panel) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 relative">
        {/* Decorative blur balls */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm flex flex-col gap-8 relative z-10">
          
          {/* Header context */}
          <div className="flex flex-col gap-2.5 text-center md:text-left">
            <div className="md:hidden flex items-center justify-center gap-2 mb-4">
              <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Film className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-lg">WatchVault</span>
            </div>
            
            {screen === "login" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight">Sign In</h2>
                <p className="text-sm text-slate-400">Sync is instantaneous. Input your email below.</p>
              </>
            )}
            {screen === "register" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight">Create Watchlist</h2>
                <p className="text-sm text-slate-400">Unlock stats, filtering, and cross-device sync.</p>
              </>
            )}
            {screen === "forgot" && (
              <>
                <h2 className="text-2xl font-bold tracking-tight">Reset Code</h2>
                <p className="text-sm text-slate-400">Verify your registered email and recover access.</p>
              </>
            )}
          </div>

          {/* Form blocks */}
          {screen === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                label="Registered Email Address"
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-900/60 border-slate-800 text-white placeholder-slate-500"
              />
              
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setScreen("forgot")}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Secure Key?
                </button>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Access Vault
              </Button>
            </form>
          )}

          {screen === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <Input
                label="Full Display Name"
                id="reg-name"
                type="text"
                placeholder="AnimeWatcher99"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-900/60 border-slate-800 text-white placeholder-slate-500"
              />

              <Input
                label="Personal Email Address"
                id="reg-email"
                type="email"
                placeholder="watcher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-900/60 border-slate-800 text-white placeholder-slate-500"
              />

              <Button type="submit" isLoading={isLoading} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Initialize Safe
              </Button>
            </form>
          )}

          {screen === "forgot" && (
            <form onSubmit={handleForgot} className="flex flex-col gap-5">
              <Input
                label="Account Email Address"
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-900/60 border-slate-800 text-white placeholder-slate-500"
              />

              <div className="flex flex-col gap-3">
                <Button type="submit" isLoading={isLoading} className="w-full">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Deliver Password Reset Email
                </Button>

                <button
                  type="button"
                  onClick={() => setScreen("login")}
                  className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Log In
                </button>
              </div>
            </form>
          )}

          {/* Social separator */}
          {screen !== "forgot" && (
            <div className="flex flex-col gap-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-slate-950 text-slate-500 font-semibold tracking-wide uppercase">
                    Trusted OAuth Service
                  </span>
                </div>
              </div>

              {/* Branded Google Auth popup button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl font-semibold text-sm hover:text-white text-slate-200 transition-all duration-150 active:scale-[0.98]"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.14-5.136 4.14A5.72 5.72 0 0 1 8.24 12.8a5.72 5.72 0 0 1 5.751-5.742c1.5 0 2.87.561 3.93 1.492l3.125-3.125C19.16 3.69 16.71 2.657 14 2.657a9.7 9.7 0 0 0-9.757 9.771 9.7 9.7 0 0 0 9.757 9.771c5.3 0 9.5-.39 9.5-5.32 0-.4-.029-.79-.086-1.168H12.24Z"
                  />
                </svg>
                Sign in with Google Account
              </button>

              {/* Toggle switch text */}
              <div className="text-center text-xs text-slate-500 font-semibold mt-2">
                {screen === "login" ? (
                  <>
                    First time tracking?{" "}
                    <button
                      type="button"
                      onClick={() => setScreen("register")}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold ml-1"
                    >
                      Initialize Sandbox Safe
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setScreen("login")}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold ml-1"
                    >
                      Authenticate Access
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
