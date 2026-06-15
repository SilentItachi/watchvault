import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "../lib/firebase";
import { UserProfile } from "../types";

interface AuthContextProps {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (email: string, name: string) => Promise<User>;
  signInWithEmail: (email: string) => Promise<User>;
  forgotPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  updateProfilePhoto: (url: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync / create profile in firestore
  const syncProfile = async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || null,
          theme: "dark",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile({
          ...newProfile,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        const data = snap.data();
        setProfile({
          uid: data.uid,
          displayName: data.displayName,
          email: data.email,
          photoURL: data.photoURL || null,
          theme: data.theme || "dark",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        });
      }
    } catch (error) {
      console.error("Failed to sync Firestore UserProfile:", error);
      // We should handle the error and report if needed
      handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, name: string): Promise<User> => {
    // Note: To simplify popup auth requirements and meet Firebase sandbox expectations,
    // Google Login is enabled as the standard OAuth provider. We also support standard Mock/Email registrations
    // for developer testing through standard Firebase auth if enabled, but provide standard sign up flows.
    // Let's create user with custom temporary generic passwords to simplify signup UX or support standard registration.
    const tempPassword = "WatchVault_Temporary_Password_123!!";
    const cred = await createUserWithEmailAndPassword(auth, email, tempPassword);
    await updateProfile(cred.user, { displayName: name });
    
    // Create or update Profile manually
    const userDocRef = doc(db, "users", cred.user.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        await updateDoc(userDocRef, {
          displayName: name,
          updatedAt: serverTimestamp()
        });
        setProfile(prev => prev ? { ...prev, displayName: name, updatedAt: new Date() } : null);
      } else {
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          displayName: name,
          email: email,
          photoURL: null,
          theme: "dark",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile({
          ...newProfile,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${cred.user.uid}`);
    }
    return cred.user;
  };

  const signInWithEmail = async (email: string): Promise<User> => {
    const tempPassword = "WatchVault_Temporary_Password_123!!";
    const cred = await signInWithEmailAndPassword(auth, email, tempPassword);
    await syncProfile(cred.user);
    return cred.user;
  };

  const forgotPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async (): Promise<User> => {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncProfile(cred.user);
    return cred.user;
  };

  const logout = async (): Promise<void> => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfileName = async (name: string): Promise<void> => {
    if (!user) throw new Error("Unauthenticated user");
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, {
        displayName: name,
        updatedAt: serverTimestamp()
      });
      setProfile(prev => prev ? { ...prev, displayName: name, updatedAt: new Date() } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateProfilePhoto = async (url: string | null): Promise<void> => {
    if (!user) throw new Error("Unauthenticated user");
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, {
        photoURL: url,
        updatedAt: serverTimestamp()
      });
      setProfile(prev => prev ? { ...prev, photoURL: url, updatedAt: new Date() } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUpWithEmail,
      signInWithEmail,
      forgotPassword,
      loginWithGoogle,
      logout,
      updateProfileName,
      updateProfilePhoto
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
