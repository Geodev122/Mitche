import React from 'react';
import { User, Role, HopePointCategory, VerificationStatus } from '../types';
// Import enhanced types for Phase 1 features
import { User as EnhancedUser, SearchFilters } from '../types-enhanced';
import { firebaseService } from '../services/firebase';
import { EnhancedFirebaseService } from '../services/firebase-enhanced';
import i18n from '../i18n';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirebaseEnabled: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addHopePoints: (points: number, category: HopePointCategory) => void;
  updateUser: (updatedUserData: Partial<User>) => Promise<void>;
  getUserById: (userId: string) => User | undefined;
  updateAnyUser: (updatedUser: User) => void;
  getAllUsers: () => User[];
  generateUniqueUsernames: () => string[];
  updateVerificationStatus: (userId: string, status: 'Approved' | 'Rejected') => void;
  migrateToFirebase: () => Promise<void>;
  // Enhanced services for Phase 1 features
  enhancedFirebase: EnhancedFirebaseService;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const ADJECTIVES = ['Silent', 'Hopeful', 'Golden', 'Brave', 'Kind', 'Guiding', 'Gentle', 'Mystic', 'Radiant', 'Shining'];
const NOUNS = ['Star', 'Echo', 'River', 'Guardian', 'Light', 'Flower', 'Stone', 'Heart', 'Voice', 'Hand'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFirebaseEnabled, setIsFirebaseEnabled] = React.useState(false);
  const authUnsubscribe = React.useRef<(() => void) | null>(null);
  
  // Initialize enhanced Firebase service
  const enhancedFirebase = React.useMemo(() => new EnhancedFirebaseService(), []);

  // Initialize authentication state
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to initialize Firebase auth listener
        authUnsubscribe.current = firebaseService.onAuthStateChange((firebaseUser) => {
          setIsFirebaseEnabled(!!firebaseUser);
          setIsLoading(false);
          if (firebaseUser) {
            // Subscribe to the user's document for real-time updates (badges, hopePoints, etc.)
            const unsubscribeUser = firebaseService.subscribeToUser(firebaseUser.id, (userDoc) => {
              setUser(userDoc);
            });
            // Replace authUnsubscribe.current with a combined cleanup
            authUnsubscribe.current = () => {
              unsubscribeUser();
            };
          } else {
            setUser(null);
          }
        });

        // Give Firebase a moment to initialize
        setTimeout(() => {
          if (!isFirebaseEnabled) {
            // Fallback to localStorage if Firebase isn't available
            initializeLocalStorageAuth();
          }
        }, 2000);
      } catch (error) {
        console.warn('Firebase not available, using localStorage:', error);
        initializeLocalStorageAuth();
      }
    };

    const initializeLocalStorageAuth = () => {
      try {
        const storedUser = localStorage.getItem('michyUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id && parsedUser.username) {
            const users = getUsers();
            const userExists = users.find(u => u.id === parsedUser.id);
            if (userExists) {
              setUser(userExists);
            } else {
              localStorage.removeItem('michyUser');
            }
          } else {
            localStorage.removeItem('michyUser');
          }
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('michyUser');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (authUnsubscribe.current) {
        authUnsubscribe.current();
      }
    };
  }, []);

  // localStorage fallback methods
  const getUsers = (): User[] => {
    try {
      const users = localStorage.getItem('mitcheUsers');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem('mitcheUsers', JSON.stringify(users));
    } catch (error) {
      console.error("Failed to save users to localStorage", error);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!username.trim() || !password.trim()) {
      return { success: false, message: i18n.t('auth.errorInvalid') };
    }

    if (isFirebaseEnabled) {
      // Try Firebase authentication first
      const email = username.includes('@') ? username : `${username}@mitche.local`;
      return await firebaseService.signInWithEmailPassword(email, password);
    } else {
      // Fallback to localStorage
      const users = getUsers();
      const foundUser = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
      );
      
      if (foundUser) {
        try {
          localStorage.setItem('michyUser', JSON.stringify(foundUser));
          setUser(foundUser);
          return { success: true };
        } catch (error) {
          console.error("Failed to save user to localStorage during login", error);
          return { success: false, message: "Storage error occurred" };
        }
      }
      
      return { success: false, message: i18n.t('auth.errorInvalid') };
    }
  };

  const signup = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!username.trim() || !password.trim()) {
      return { success: false, message: i18n.t('auth.errorInvalid') };
    }

    if (username.length < 3) {
      return { success: false, message: "Username must be at least 3 characters" };
    }

    if (password.length < 4) {
      return { success: false, message: "Password must be at least 4 characters" };
    }

    // Determine role based on username patterns
    let userRole: Role = Role.Citizen;
    let verificationStatus: VerificationStatus = 'NotRequested';
    
    const upperUsername = username.toUpperCase();
    if (upperUsername.includes('NGO')) {
        userRole = Role.NGO;
        verificationStatus = 'Pending';
    } else if (upperUsername.includes('GOV') || upperUsername.includes('GOVERNMENT')) {
        userRole = Role.PublicWorker;
        verificationStatus = 'Pending';
    } else if (upperUsername.includes('ADMIN')) {
        userRole = Role.Admin;
        verificationStatus = 'Approved'; 
    }

    if (isFirebaseEnabled) {
      // Use Firebase
      const email = username.includes('@') ? username : `${username}@mitche.local`;
      return await firebaseService.createUserWithEmailPassword(email, password, {
        username: username.trim(),
        role: userRole,
        verificationStatus,
        symbolicName: '',
        symbolicIcon: '',
        hopePoints: 0,
        hopePointsBreakdown: {},
        hasCompletedOnboarding: false,
        isVerified: userRole === Role.Admin,
        commendations: { Kind: 0, Punctual: 0, Respectful: 0 }
      });
    } else {
      // Fallback to localStorage
      const users = getUsers();
      
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: i18n.t('auth.errorExists') };
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: username.trim(),
        password: password.trim(),
        symbolicName: '',
        symbolicIcon: '',
        role: userRole,
        hopePoints: 0,
        hopePointsBreakdown: {},
        hasCompletedOnboarding: false,
        isVerified: userRole === Role.Admin,
        verificationStatus: verificationStatus,
        commendations: { Kind: 0, Punctual: 0, Respectful: 0 }
      };

      try {
        users.push(newUser);
        saveUsers(users);
        return await login(username, password);
      } catch (error) {
        console.error("Failed to create user", error);
        return { success: false, message: "Failed to create account" };
      }
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    if (!isFirebaseEnabled) {
      return { success: false, message: "Google sign-in requires Firebase authentication" };
    }

    try {
      return await firebaseService.signInWithGoogle();
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      return { success: false, message: error.message || "Failed to sign in with Google" };
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseEnabled) {
        await firebaseService.signOut();
      } else {
        localStorage.removeItem('michyUser');
        setUser(null);
      }
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const updateUser = async (updatedUserData: Partial<User>): Promise<void> => {
    if (!user) return;
    
    if (isFirebaseEnabled) {
      const success = await firebaseService.updateUser(user.id, updatedUserData);
      if (success) {
        setUser({ ...user, ...updatedUserData });
      }
    } else {
      // localStorage fallback
      const updatedUser = { ...user, ...updatedUserData };
      setUser(updatedUser);
      localStorage.setItem('michyUser', JSON.stringify(updatedUser));

      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          saveUsers(users);
      }
    }
  };

  const addHopePoints = (points: number, category: HopePointCategory) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      hopePoints: user.hopePoints + points,
      hopePointsBreakdown: {
        ...user.hopePointsBreakdown,
        [category]: (user.hopePointsBreakdown[category] || 0) + points,
      }
    };
    updateUser(updatedUser);
  };

  const getUserById = (userId: string): User | undefined => {
    if (isFirebaseEnabled) {
      // Note: This would need to be async in real implementation
      // For now, return undefined and let components use real-time subscriptions
      return undefined;
    } else {
      const users = getUsers();
      return users.find(u => u.id === userId);
    }
  };

  const updateAnyUser = (updatedUser: User) => {
    if (isFirebaseEnabled) {
      firebaseService.updateUser(updatedUser.id, updatedUser);
    } else {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          saveUsers(users);
          if (user && user.id === updatedUser.id) {
              setUser(updatedUser);
              localStorage.setItem('michyUser', JSON.stringify(updatedUser));
          }
      }
    }
  };
  
  const updateVerificationStatus = (userId: string, status: 'Approved' | 'Rejected') => {
    if (isFirebaseEnabled) {
      firebaseService.updateUser(userId, {
        verificationStatus: status,
        isVerified: status === 'Approved'
      });
    } else {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
          users[userIndex].verificationStatus = status;
          users[userIndex].isVerified = status === 'Approved';
          saveUsers(users);
          
          if (user && user.id === userId) {
              setUser(users[userIndex]);
              localStorage.setItem('michyUser', JSON.stringify(users[userIndex]));
          }
      }
    }
  };

  const getAllUsers = (): User[] => {
    if (isFirebaseEnabled) {
      // Note: This should be async in real implementation
      return [];
    } else {
      return getUsers();
    }
  };
  
  const generateUniqueUsernames = (): string[] => {
    const users = isFirebaseEnabled ? [] : getUsers(); // Simplified for now
    const existingUsernames = new Set(users.map(u => u.username.toLowerCase()));
    const generatedUsernames = new Set<string>();

    let attempts = 0;
    while (generatedUsernames.size < 5 && attempts < 50) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = Math.floor(100 + Math.random() * 900);
      const newUsername = `${adj}${noun}_${num}`;
      
      if (!existingUsernames.has(newUsername.toLowerCase())) {
        generatedUsernames.add(newUsername);
      }
      attempts++;
    }

    return Array.from(generatedUsernames);
  };

  const migrateToFirebase = async (): Promise<void> => {
    if (isFirebaseEnabled) {
      await firebaseService.migrateFromLocalStorage();
      console.log('Migration to Firebase completed!');
    } else {
      console.warn('Firebase not available for migration');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      isFirebaseEnabled,
      login, 
      signup,
      signInWithGoogle, 
      logout, 
      addHopePoints, 
      updateUser, 
      getUserById, 
      updateAnyUser, 
      getAllUsers, 
      generateUniqueUsernames, 
      updateVerificationStatus,
      migrateToFirebase,
      enhancedFirebase
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};