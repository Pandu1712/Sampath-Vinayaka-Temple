import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, getDocFromServer } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from "./types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSubAdmin: boolean;
  isSuperAdmin: boolean;
  canManageEvents: boolean;
  canManageGallery: boolean;
  canManageTimings: boolean;
  authError: string | null;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          let docSnap;
          try {
            docSnap = await getDoc(docRef);
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
          
          if (docSnap && docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            // Only allow admin roles to log in
            if (profileData.role === "user" && user.email?.toLowerCase() !== "sampathvinayakatemplevizag@gmail.com") {
              await signOut(auth);
              setAuthError("Access denied. Only administrators can log in.");
              setUser(null);
              setProfile(null);
            } else {
              setProfile(profileData);
              setUser(user);
            }
          } else {
            // Default superadmin check for the provided email
            if (user.email?.toLowerCase() === "sampathvinayakatemplevizag@gmail.com") {
              const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || user.email?.split('@')[0] || "Super Admin",
                photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.email || 'Admin'}&background=random`,
                role: "superadmin",
                createdAt: new Date().toISOString(),
              };
              try {
                await setDoc(docRef, newProfile);
              } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
              }
              setProfile(newProfile);
              setUser(user);
            } else {
              // Not the superadmin email and no profile exists
              await signOut(auth);
              setAuthError("Access denied. No administrative account found for this email.");
              setUser(null);
              setProfile(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError("The login popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        setAuthError("The login process was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("The login window was closed before completion.");
      } else {
        setAuthError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login error:", error.code, error.message);
      
      // Auto-signup for super admin if account doesn't exist yet
      if (email.toLowerCase() === "sampathvinayakatemplevizag@gmail.com" && 
          (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        try {
          console.log("Attempting auto-signup for super admin...");
          await createUserWithEmailAndPassword(auth, email, pass);
          console.log("Auto-signup successful.");
          return; // Success
        } catch (signupError: any) {
          console.error("Auto-signup error:", signupError.code, signupError.message);
          // If signup fails because email is already in use, it means the password provided is wrong
          if (signupError.code === 'auth/email-already-in-use') {
            setAuthError("Incorrect password for the Super Admin account.");
            return;
          }
        }
      }

      if (error.code === 'auth/operation-not-allowed') {
        setAuthError("Email/Password login is not enabled in the Firebase Console. Please enable it under Authentication > Sign-in method.");
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setAuthError("Invalid email or password. Please check your credentials.");
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError("Too many failed login attempts. Please try again later.");
      } else {
        setAuthError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isSuperAdmin = profile?.role === "superadmin";
  const isAdmin = profile?.role === "admin" || isSuperAdmin;
  const isSubAdmin = profile?.role === "subadmin" || isAdmin;

  const canManageEvents = isAdmin || (profile?.role === "subadmin" && (profile.permissions?.manageEvents ?? true));
  const canManageGallery = isAdmin || (profile?.role === "subadmin" && (profile.permissions?.manageGallery ?? true));
  const canManageTimings = isAdmin || (profile?.role === "subadmin" && (profile.permissions?.manageTimings ?? true));

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      login, 
      loginWithEmail, 
      logout, 
      isAdmin, 
      isSubAdmin, 
      isSuperAdmin, 
      canManageEvents,
      canManageGallery,
      canManageTimings,
      authError, 
      isLoggingIn 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
