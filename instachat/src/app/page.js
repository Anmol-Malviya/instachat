"use client";

import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Video, Shield, User, Mail, Lock, ArrowRight, Loader2, AlertCircle, Zap, Globe } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loginWithGoogle, registerWithEmail, loginWithEmail } = useAuth();
  const router = useRouter();
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (authMode === "signup") {
        await registerWithEmail(formData.email, formData.password, formData.name);
      } else {
        await loginWithEmail(formData.email, formData.password);
      }
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Incorrect email or password.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your connection.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white selection:bg-white selection:text-black font-sans">
      
      {/* Navbar Minimalist */}
      <nav className="absolute top-0 left-0 w-full p-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-white text-black rounded-lg">
            <MessageCircle size={18} className="fill-black" />
          </div>
          <span className="text-xl font-black tracking-tighter">InstaChat</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-12 mx-auto max-w-[1400px] min-h-screen flex flex-col xl:flex-row items-center justify-center gap-16 xl:gap-24">
        
        {/* Left Side: Copy & Bento Grid */}
        <div className="w-full xl:w-[55%] flex flex-col z-10 mt-10 xl:mt-0">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6 max-w-2xl"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] leading-[1.05] font-black tracking-tighter text-white">
              Connect. Call. Share.
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 font-medium tracking-tight max-w-xl">
              Experience real-time communication stripped to its purest form. No noise, just instant connection.
            </p>
          </motion.div>

          {/* Bento Grid Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16"
          >
            <div className="bg-zinc-950 border border-white/10 p-8 flex flex-col justify-between aspect-square sm:aspect-auto sm:h-64 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-white text-black flex items-center justify-center mb-6">
                <Zap size={24} className="fill-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Lightning Fast</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">Messages delivered instantly via WebSocket architecture.</p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-white/10 p-8 flex flex-col justify-between aspect-square sm:aspect-auto sm:h-64 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-6 border border-white/10">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Secure & Private</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">End-to-end focus with zero compromises on privacy.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Auth Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="w-full xl:w-[45%] max-w-md mx-auto xl:mx-0"
        >
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 sm:p-10">
            
            {/* Minimalist Switcher */}
            <div className="flex bg-black border border-white/10 p-1.5 rounded-xl mb-8 relative">
              <motion.div 
                className="absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-white rounded-lg"
                animate={{ x: authMode === "login" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button 
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 text-sm font-bold transition-colors z-10 ${authMode === 'login' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 text-sm font-bold transition-colors z-10 ${authMode === 'signup' ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black tracking-tight mb-2">{authMode === 'login' ? 'Welcome back' : 'Join InstaChat'}</h3>
              <p className="text-zinc-500 text-sm">{authMode === 'login' ? 'Enter your details to sign in.' : 'Register below to start chatting.'}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {authMode === "signup" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        className="w-full rounded-xl bg-black border border-white/10 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-white focus:ring-1 focus:ring-white"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required={authMode === "signup"}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="w-full rounded-xl bg-black border border-white/10 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-white focus:ring-1 focus:ring-white"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full rounded-xl bg-black border border-white/10 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-white focus:ring-1 focus:ring-white"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-white text-xs bg-red-500/20 p-4 rounded-xl border border-red-500/30">
                  <AlertCircle size={14} className="text-red-400" /> {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-4 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <> {authMode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /> </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-zinc-500"><span className="bg-zinc-950 px-4">Or</span></div>
            </div>

            <button 
              onClick={loginWithGoogle}
              className="w-full h-12 bg-black border border-white/10 text-white hover:bg-white/5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3"
            >
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} height={18} />
              Continue with Google
            </button>
          </div>
        </motion.div>
      </main>
      
      <footer className="w-full border-t border-white/5 py-8 mt-auto">
        <div className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold text-center">
          © 2026 InstaChat Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
