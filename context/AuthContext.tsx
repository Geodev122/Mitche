import React from 'react';
import { User, Role, HopePointCategory, VerificationStatus } from '../types';
import i18n from '../i18n';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addHopePoints: (points: number, category: HopePointCategory) => void;
  updateUser: (updatedUserData: Partial<User>) => Promise<void>;
  getUserById: (userId: string) => User | undefined;
  updateAnyUser: (updatedUser: User) => void;
  getAllUsers: () => User[];
  generateUniqueUsernames: () => string[];
  updateVerificationStatus: (userId: string, status: 'Approved' | 'Rejected') => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const ADJECTIVES = ['Silent', 'Hopeful', 'Golden', 'Brave', 'Kind', 'Guiding', 'Gentle', 'Mystic', 'Radiant', 'Shining'];
const NOUNS = ['Star', 'Echo', 'River', 'Guardian', 'Light', 'Flower', 'Stone', 'Heart', 'Voice', 'Hand'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize authentication state
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('michyUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Validate user structure
          if (parsedUser && parsedUser.id && parsedUser.username) {
            // Ensure user exists in users database
            const users = getUsers();
            const userExists = users.find(u => u.id === parsedUser.id);
            if (userExists) {
              setUser(userExists); // Use fresh data from database
            } else {
              // User not found in database, clear local storage
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
        // Add small delay to prevent flash
        setTimeout(() => setIsLoading(false), 100);
      }
    };

    initializeAuth();
  }, []);

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

    const users = getUsers();
    
    // Check for existing username (case-insensitive)
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: i18n.t('auth.errorExists') };
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

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: username.trim(),
      password: password.trim(), // In production, this would be hashed
      symbolicName: '',
      symbolicIcon: '',
      role: userRole,
      hopePoints: 0,
      hopePointsBreakdown: {},
      hasCompletedOnboarding: false,
      isVerified: userRole === Role.Admin,
      verificationStatus: verificationStatus,
      commendations: {
        Kind: 0,
        Punctual: 0,
        Respectful: 0,
      },
    };

    try {
      users.push(newUser);
      saveUsers(users);
      return await login(username, password);
    } catch (error) {
      console.error("Failed to create user", error);
      return { success: false, message: "Failed to create account" };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('michyUser');
      setUser(null);
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const updateUserState = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      localStorage.setItem('michyUser', JSON.stringify(updatedUser));

      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          saveUsers(users);
      }
    } catch (error) {
      console.error("Failed to update user state", error);
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
    updateUserState(updatedUser);
  };

  const updateUser = async (updatedUserData: Partial<User>): Promise<void> => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedUserData };
    await updateUserState(updatedUser as User);
  };

  const getUserById = (userId: string): User | undefined => {
    const users = getUsers();
    return users.find(u => u.id === userId);
  };

  const updateAnyUser = (updatedUser: User) => {
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
  };
  
  const updateVerificationStatus = (userId: string, status: 'Approved' | 'Rejected') => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].verificationStatus = status;
        users[userIndex].isVerified = status === 'Approved';
        saveUsers(users);
        
        // If the updated user is the currently logged-in user, update their state
        if (user && user.id === userId) {
            setUser(users[userIndex]);
            localStorage.setItem('michyUser', JSON.stringify(users[userIndex]));
        }
    }
  };

  const getAllUsers = (): User[] => {
    return getUsers();
  };
  
  const generateUniqueUsernames = (): string[] => {
    const users = getUsers();
    const existingUsernames = new Set(users.map(u => u.username.toLowerCase()));
    const generatedUsernames = new Set<string>();

    let attempts = 0;
    while (generatedUsernames.size < 5 && attempts < 50) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = Math.floor(100 + Math.random() * 900); // 3-digit number
      const newUsername = `${adj}${noun}_${num}`;
      
      if (!existingUsernames.has(newUsername.toLowerCase())) {
        generatedUsernames.add(newUsername);
      }
      attempts++;
    }

    return Array.from(generatedUsernames);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      login, 
      signup, 
      logout, 
      addHopePoints, 
      updateUser, 
      getUserById, 
      updateAnyUser, 
      getAllUsers, 
      generateUniqueUsernames, 
      updateVerificationStatus 
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