import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../ui/Toast";
import { PageContainer } from "../layout/PageContainer";
import { Button, Input } from "../ui/Primitives";
import { User, Mail, ShieldAlert, LogOut, Loader2, Image as ImageIcon, Sparkles, Check, Moon, Sun } from "lucide-react";

const PRESET_AVATARS = [
  { id: "p1", name: "Popcorn Cinephile", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" },
  { id: "p2", name: "Cyber Samurai", url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=150" },
  { id: "p3", name: "Super Hero", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" },
  { id: "p4", name: "Retro Astronaut", url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" },
  { id: "p5", name: "Chibi Neko", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" }
];

export const ProfilePage: React.FC = () => {
  const { profile, updateProfileName, updateProfilePhoto, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast("Display Name cannot be empty", "error");
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateProfileName(displayName.trim());
      if (photoURL !== profile?.photoURL) {
        await updateProfilePhoto(photoURL.trim() || null);
      }
      showToast("Vault profile updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failing to update user data", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectPreset = async (url: string) => {
    setPhotoURL(url);
    try {
      await updateProfilePhoto(url);
      showToast("Avatar preset saved", "success");
    } catch (err) {
      showToast("Failed to write avatar change", "error");
    }
  };

  // Human date formats
  const formattedRegistrationDate = () => {
    if (!profile?.createdAt) return "Unknown";
    const date = profile.createdAt instanceof Date ? profile.createdAt : new Date(profile.createdAt);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <PageContainer>
      
      {/* Profile Header Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          Profile Settings <Sparkles className="h-5 text-amber-500 animate-pulse shrink-0" />
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Manage your display name, theme states, and avatar parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start shrink-0">
        
        {/* Left Card: Summary overview */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-5 relative overflow-hidden">
          
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 pointer-events-none" />

          {/* User Image frame */}
          <div className="relative mt-4">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-full object-cover border-4 border-indigo-500/20 shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-black text-3xl shadow-lg shadow-indigo-500/10 flex items-center justify-center">
                {profile?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 min-w-0 w-full">
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-neutral-50 truncate">
              {profile?.displayName}
            </h3>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-bold flex items-center justify-center gap-1.5 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {profile?.email}
            </span>
          </div>

          <div className="w-full border-t border-gray-100 dark:border-neutral-850 pt-4 flex flex-col gap-2.5 text-left">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-400">Registry Date:</span>
              <span className="text-neutral-800 dark:text-neutral-200">{formattedRegistrationDate()}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-400">Vault Security:</span>
              <span className="text-emerald-500 flex items-center gap-1 font-bold">
                ● Active Sync
              </span>
            </div>
          </div>

          {/* Sign Out Trigger */}
          <button
            onClick={logout}
            className="cursor-pointer w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50/70 hover:bg-rose-50 dark:bg-rose-500/10 hover:dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out Vault Account
          </button>

        </div>

        {/* Right card Group: Editable profiles & presets */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Section: Profile Form */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Profile Details</h3>
              <p className="text-xs text-neutral-400">Adjust the public display identities of your account</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              
              <Input
                label="Your Account Name"
                id="profile-name-input"
                type="text"
                placeholder="Watcher"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <Input
                label="Custom Photo URL (optional)"
                id="profile-photo-input"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                helper="Or type any secure image address directly"
              />

              <Button type="submit" isLoading={isUpdating} className="self-end px-6">
                Save Adjustments
              </Button>

            </form>
          </div>

          {/* Curated Pre-Built Preset Avatars list */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Illustration Presets</h3>
              <p className="text-xs text-neutral-400">Choose from pre-approved secure watcher avatars</p>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              {PRESET_AVATARS.map((p) => {
                const isSelected = profile?.photoURL === p.url;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.url)}
                    className="group relative cursor-pointer focus:outline-none"
                    title={p.name}
                  >
                    <img
                      src={p.url}
                      alt={p.name}
                      className={`h-14 w-14 rounded-full object-cover border-2 transition-all duration-200 group-hover:scale-105 ${
                        isSelected 
                          ? "border-indigo-600 scale-105 shadow-md shadow-indigo-600/20" 
                          : "border-gray-100 dark:border-neutral-800 hover:border-indigo-500/30"
                      }`}
                    />
                    {isSelected && (
                      <div className="absolute right-0 bottom-0 bg-indigo-650 text-white rounded-full p-0.5 shadow-sm border border-white dark:border-neutral-900">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Theme Selector Card */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">Theme Mode</h3>
              <p className="text-xs text-neutral-400">Toggle between day and night backgrounds</p>
            </div>

            <button
              onClick={toggleTheme}
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 rounded-xl text-xs font-bold border border-gray-150 dark:border-neutral-800 text-gray-800 dark:text-neutral-200 shadow-xs transition-colors duration-150"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>Switch Day Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span>Switch Night Mode</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </PageContainer>
  );
};
