"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile
} from "firebase/auth";
import { auth, db } from "@/integrations/firebase/config";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { usePathname, useRouter } from "@/src/i18n/routing";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  profession: string | null;
  preferred_language: string;
  is_admin?: boolean;
  is_verified?: boolean;
  status?: string;
  license_number?: string;
  professional_title?: string;
  subscription_expires_at?: string | null;
  subscription_tier?: string | null;
  email_confirmed?: boolean;
  phone?: string;
  plan?: string | null;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  subscriptionExpiresAt?: string | null;
  trial_expires_at?: any;
  daily_usage?: any;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, additionalData?: { phone?: string; licenseNumber?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['achourzineddine16@gmail.com'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Check your environment variables and restart your dev server.");
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const docRef = doc(db, "profiles", currentUser.uid);

        // Check if profile exists, if not, create it first
        try {
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            const isAdminEmail = currentUser.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase());
            const newProfileData = {
              id: currentUser.uid,
              user_id: currentUser.uid,
              display_name: currentUser.displayName || currentUser.email?.split('@')[0] || "User",
              preferred_language: 'fr',
              is_admin: isAdminEmail || false,
              is_verified: true,
              email_confirmed: isAdminEmail || false, // Admin is auto confirmed
              status: 'active',
              professional_title: 'Traducteur Assermenté',
              created_at: serverTimestamp()
            };
            await setDoc(docRef, newProfileData);
          }
        } catch (profileErr) {
          console.warn("Error checking/creating profile doc on auth state change:", profileErr);
        }

        // Set up real-time listener for the profile document to get live email_confirmed updates!
        unsubscribeProfile = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Profile;
            const isAdminEmail = currentUser.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase());
            if (isAdminEmail) {
              data.is_admin = true;
            }
            setProfile(data);
          }
          setLoading(false);
        }, (err) => {
          console.warn("Firestore profile listener error:", err);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Global Route Guard to enforce email confirmation
  useEffect(() => {
    if (loading) return;

    if (user && profile) {
      const isPending = profile.email_confirmed === false;
      const isAdmin = profile.is_admin === true;

      // Only protect private routes, never intercept register, login or verify-pending itself
      const isProtectedRoute = pathname && (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/ocr') ||
        pathname.startsWith('/translate') ||
        pathname.startsWith('/document-translation') ||
        pathname.startsWith('/workspace') ||
        pathname.startsWith('/admin')
      );

      if (isPending && !isAdmin && isProtectedRoute) {
        router.push('/auth/verify-pending');
      }
    }
  }, [user, profile, loading, pathname, router]);

  const signUp = async (email: string, password: string, displayName: string, additionalData?: { phone?: string; licenseNumber?: string }) => {
    if (!auth) {
      return { error: new Error("Firebase n'est pas initialisé. Vérifiez vos clés dans .env.local et redémarrez le serveur (npm run dev).") };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      await firebaseUpdateProfile(currentUser, { displayName });

      try {
        const isAdminEmail = email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
        const docRef = doc(db, "profiles", currentUser.uid);
        
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 7); // 7-day free trial

        const newProfileData = {
          id: currentUser.uid,
          user_id: currentUser.uid,
          display_name: displayName,
          preferred_language: 'fr',
          is_admin: isAdminEmail || false,
          is_verified: false, // Default to false until verified by admin
          email_confirmed: isAdminEmail || false, // Must be confirmed via email link
          status: 'active',
          professional_title: 'Traducteur Assermenté',
          subscription_tier: 'free_trial',
          trial_started_at: serverTimestamp(),
          trial_expires_at: trialExpiresAt,
          created_at: serverTimestamp(),
          phone: additionalData?.phone || '',
          license_number: additionalData?.licenseNumber || '',
        };

        await setDoc(docRef, newProfileData);

        // Send confirmation email containing direct activation link
        try {
          fetch('/api/send-welcome', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: currentUser.email || email,
              displayName: displayName,
              uid: currentUser.uid,
            }),
          });
        } catch (emailSendErr) {
          console.error("Erreur lors de l'envoi de l'e-mail de bienvenue:", emailSendErr);
        }
      } catch (profileErr) {
        console.error("Error creating Firestore profile:", profileErr);
      }

      return { error: null };
    } catch (error: any) {
      console.error("SignUp error:", error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send reset email");
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const docRef = doc(db, "profiles", user.uid);
      await updateDoc(docRef, updates);
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
