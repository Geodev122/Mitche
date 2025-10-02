import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, Role } from '../types';
import { PermissionManager } from '../utils/permissions';
import { PermissionType } from '../types-roles-enhanced';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  hasPermission: (permission: PermissionType) => boolean;
  canModerate: (targetUser: any) => boolean;
  getUserTrustScore: () => number;
  getHopeMultiplier: () => number;
  needsVerification: () => boolean;
  getDashboardFeatures: () => string[];
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize or update user profile in Firestore
  const initializeUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update last login
      await updateDoc(userRef, {
        lastActiveAt: new Date(),
        updatedAt: new Date()
      });
      
      const userData = { id: firebaseUser.uid, ...userSnap.data() } as User;
      
      // Ensure all required fields exist for role system
      if (!userData.hasOwnProperty('isVerified')) {
        await updateDoc(userRef, {
          isVerified: false,
          verificationStatus: 'NotRequested'
        });
        userData.isVerified = false;
        userData.verificationStatus = 'NotRequested';
      }
      
      return userData;
    } else {
      // Create new user profile
      const newUser = {
        username: firebaseUser.email?.split('@')[0] || 'User',
        password: '', // Firebase handles auth
        symbolicName: '',
        symbolicIcon: '',
        role: Role.Citizen,
        hopePoints: 0,
        hopePointsBreakdown: {},
        hasCompletedOnboarding: false,
        isVerified: false,
        verificationStatus: 'NotRequested' as any,
        commendations: { Kind: 0, Punctual: 0, Respectful: 0 }
      };

      await setDoc(userRef, {
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return { id: firebaseUser.uid, ...newUser } as User;
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async (): Promise<void> => {
    if (!firebaseUser) return;

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = { id: firebaseUser.uid, ...userSnap.data() } as User;
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Enhanced permission checking
  const hasPermission = (permission: PermissionType): boolean => {
    return PermissionManager.hasPermission(user, permission);
  };

  // Check if current user can moderate target user
  const canModerate = (targetUser: any): boolean => {
    return PermissionManager.canModerate(user, targetUser);
  };

  // Get user's trust score
  const getUserTrustScore = (): number => {
    if (!user) return 0;
    // For legacy users without trustScore, calculate based on role and verification
    const baseScore = 50;
    const roleBonus = PermissionManager.getRoleHierarchy(user.role) * 25;
    const verificationBonus = user.isVerified ? 50 : 0;
    return baseScore + roleBonus + verificationBonus;
  };

  // Get user's hope point multiplier
  const getHopeMultiplier = (): number => {
    return PermissionManager.getEffectiveHopeMultiplier(user);
  };

  // Check if user needs verification
  const needsVerification = (): boolean => {
    return PermissionManager.needsVerification(user);
  };

  // Get dashboard features for current user
  const getDashboardFeatures = (): string[] => {
    return PermissionManager.getDashboardFeatures(user);
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(userRef, updateData);
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updateData } : null);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Sign out user
  const signOutUser = async (): Promise<void> => {
    try {
      // Update last active time before signing out
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          lastActiveAt: new Date()
        });
      }

      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          const userData = await initializeUserProfile(firebaseUser);
          setUser(userData);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signOutUser,
    updateUserProfile,
    hasPermission,
    canModerate,
    getUserTrustScore,
    getHopeMultiplier,
    needsVerification,
    getDashboardFeatures,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;