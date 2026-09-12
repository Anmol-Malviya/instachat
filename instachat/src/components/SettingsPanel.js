"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/api";
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { app } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Phone, Calendar, Save, CheckCircle2, AlertCircle, ShieldCheck, Monitor, Bell, LogOut, Camera, Mic, Settings2 } from "lucide-react";

export default function SettingsPanel() {
  const { user, profileData, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const auth = getAuth(app);

  const [formData, setFormData] = useState({
    name:     profileData?.name     || "",
    username: profileData?.username || "",
    bio:      profileData?.bio      || "",
    phone:    profileData?.phone    || "",
    dob:      profileData?.dob      || ""
  });

  const [passwords,  setPasswords]  = useState({ current: "", new: "", confirm: "" });
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Update in MongoDB via API
      await updateUser(user.uid, {
        name:     formData.name,
        username: formData.username,
        bio:      formData.bio,
        phone:    formData.phone,
        dob:      formData.dob,
      });
      await refreshProfile(user.uid);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Password change is still Firebase Auth
      const credential = EmailAuthProvider.credential(user.email, passwords.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwords.new);
      setSuccess("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to change password. Check your current password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#111827]">
      {/* ── Profile Header Banner ── */}
      <div className="relative bg-gradient-to-b from-white/10 to-transparent px-4 sm:px-8 pt-8 pb-16 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">Settings</h1>
        <p className="text-zinc-500 text-xs sm:text-sm">Manage your profile and account security.</p>
      </div>

      {/* ── Profile Card ── */}
      <div className="px-3 sm:px-6 -mt-12 mb-4 flex-shrink-0">
        <div className="bg-[#141416] border border-white/8 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-xl">
          <div className="relative flex-shrink-0">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=ffffff&color=000`}
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#09090b] shadow-lg"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-green-500 h-5 w-5 rounded-full border-2 border-[#141416]" />
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">{profileData?.name || user?.displayName || "User"}</h2>
            {profileData?.username && <p className="text-white text-sm font-medium">@{profileData.username}</p>}
            <p className="text-zinc-500 text-xs mt-1">{user?.email}</p>
            {profileData?.bio && <p className="text-zinc-400 text-xs mt-2 line-clamp-2">{profileData.bio}</p>}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="px-3 sm:px-6 mb-4 flex-shrink-0">
        <div className="flex bg-white/[0.03] border border-white/8 rounded-2xl p-1 gap-1">
          {[
            { id: "profile",    label: "Profile",  icon: <User size={15} /> },
            { id: "security",   label: "Security", icon: <ShieldCheck size={15} /> },
            { id: "permissions", label: "Permissions", icon: <Settings2 size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(""); setSuccess(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.icon}
              <span className="truncate hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Alerts ── */}
      <AnimatePresence>
        {error && (
          <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-3 sm:mx-6 mb-4 flex items-center gap-2.5 p-3.5 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex-shrink-0">
            <AlertCircle size={16} className="flex-shrink-0" /><span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div key="success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-3 sm:mx-6 mb-4 flex items-center gap-2.5 p-3.5 bg-green-500/10 text-green-400 text-sm rounded-xl border border-green-500/20 flex-shrink-0">
            <CheckCircle2 size={16} className="flex-shrink-0" /><span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="flex-1 px-3 sm:px-6 pb-28 md:pb-8">

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.form key="profile-form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 px-4 pt-4 pb-2">Basic Info</p>
              <FieldRow label="Full Name" icon={<User size={15} className="text-zinc-500" />}>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name" className="w-full bg-transparent py-3 text-sm text-white placeholder:text-zinc-600 outline-none" required />
              </FieldRow>
              <div className="border-t border-indigo-500/10" />
              <FieldRow label="Username" icon={<span className="text-zinc-500 text-sm font-bold">@</span>}>
                <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username" className="w-full bg-transparent py-3 text-sm text-white placeholder:text-zinc-600 outline-none" required />
              </FieldRow>
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 px-4 pt-4 pb-2">About You</p>
              <div className="px-4 pb-4">
                <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write a short bio..." rows="3"
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none resize-none leading-relaxed" />
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 px-4 pt-4 pb-2">Contact</p>
              <FieldRow label="Phone" icon={<Phone size={15} className="text-zinc-500" />}>
                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 890" className="w-full bg-transparent py-3 text-sm text-white placeholder:text-zinc-600 outline-none" />
              </FieldRow>
              <div className="border-t border-indigo-500/10" />
              <FieldRow label="Date of Birth" icon={<Calendar size={15} className="text-zinc-500" />}>
                <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-transparent py-3 text-sm text-white outline-none [color-scheme:dark]" />
              </FieldRow>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="button" onClick={logout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all border border-red-500/20">
                <LogOut size={16} />
                Logout
              </button>
              <button type="submit" disabled={loading}
                className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 active:scale-95 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-white/10 disabled:opacity-50">
                <Save size={16} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.form>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.form key="security-form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-indigo-500/8 border border-blue-500/20 rounded-2xl">
              <ShieldCheck size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                For security, you&apos;ll need to confirm your current password before setting a new one.
                Only applies to email/password accounts.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 px-4 pt-4 pb-2">Change Password</p>
              <FieldRow label="Current Password" icon={<Lock size={15} className="text-zinc-500" />}>
                <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••" className="w-full bg-transparent py-3 text-sm text-white placeholder:text-zinc-600 outline-none" required />
              </FieldRow>
              <div className="border-t border-indigo-500/10" />
              <FieldRow label="New Password" icon={<Lock size={15} className="text-white" />}>
                <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="Min. 6 characters" className="w-full bg-transparent py-3 text-sm text-white placeholder:text-zinc-600 outline-none" required minLength="6" />
              </FieldRow>
              <div className="border-t border-indigo-500/10" />
              <FieldRow label="Confirm Password" icon={<Lock size={15} className="text-white" />}>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Repeat new password" className="w-full bg-transparent py-3 text-sm text-white placeholder:text-zinc-600 outline-none" required minLength="6" />
              </FieldRow>
            </div>

            {passwords.new && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-1">
                <div className="flex gap-1 flex-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      passwords.new.length > i * 3
                        ? passwords.new.length < 6 ? "bg-red-500" : passwords.new.length < 10 ? "bg-yellow-500" : "bg-green-500"
                        : "bg-white/10"
                    }`} />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-500">
                  {passwords.new.length < 6 ? "Weak" : passwords.new.length < 10 ? "Fair" : "Strong"}
                </span>
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 active:scale-95 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-white/10 disabled:opacity-50">
              <Lock size={16} />
              {loading ? "Updating..." : "Update Password"}
            </button>
          </motion.form>
        )}


        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <motion.div key="permissions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Browser Notifications</h3>
                  <p className="text-xs text-zinc-500">Enable alerts for new messages.</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  typeof Notification === 'undefined' ? "bg-red-500/20 text-red-400"
                  : Notification.permission === 'granted' ? "bg-green-500/20 text-green-400"
                  : Notification.permission === 'denied' ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {typeof Notification === 'undefined' ? "Not Supported" : Notification.permission}
                </div>
              </div>

              {!window.isSecureContext && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2 items-start">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-400 leading-relaxed">
                    <strong>Insecure Context:</strong> Notifications only work on HTTPS or localhost. 
                    If you are using an IP address (like 192.168...), they will be blocked by the browser.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (typeof Notification !== 'undefined') {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') setSuccess("Notifications enabled!");
                        else setError("Permission denied.");
                        refreshProfile(user.uid); // just to force a re-render
                      });
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 text-white py-2.5 rounded-xl font-bold text-xs transition-all"
                >
                  Request Permission
                </button>
                
                <button
                  onClick={() => {
                    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                      new Notification("Test Notification", {
                        body: "This is a test notification from InstaChat!",
                        icon: "/icon-192x192.png"
                      });
                    } else {
                      setError("Please grant permission first.");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 py-2.5 rounded-xl font-bold text-xs transition-all border border-indigo-500/10"
                >
                  Send Test Notification
                </button>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Camera & Microphone</h3>
                  <p className="text-xs text-zinc-500">Required for audio and video calls.</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    stream.getTracks().forEach(track => track.stop());
                    setSuccess("Camera and Microphone access granted!");
                  } catch (err) {
                    if (err.name === 'NotAllowedError') {
                      setError("Permission denied. Check your browser's lock icon to allow access.");
                    } else {
                      setError("Could not access camera/mic: " + err.message);
                    }
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 py-2.5 rounded-xl font-bold text-xs transition-all"
              >
                <Camera size={14} />
                <Mic size={14} />
                Request Access
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">Troubleshooting</h3>
              <ul className="text-[11px] text-zinc-500 space-y-2 list-disc ml-4">
                <li>Make sure your browser is not in "Do Not Disturb" mode.</li>
                <li>Check your OS settings (Windows/macOS/Android) to allow browser notifications.</li>
                <li>On iOS, you must add this app to your Home Screen to receive notifications.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, icon, children }) {
  return (
    <div className="flex items-center gap-3 px-4 group">
      <div className="flex-shrink-0 w-5 flex items-center justify-center">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-zinc-600 font-medium pt-3 pb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}
