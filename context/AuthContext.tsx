import React from 'react';
import { User, Role, HopePointCategory, VerificationStatus } from '../types';
import i18n from '../i18n';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addHopePoints: (points: number, category: HopePointCategory) => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  getUserById: (userId: string) => User | undefined;
  updateAnyUser: (updatedUser: User) => void;
  getAllUsers: () => User[];
  generateUniqueUsernames: () => string[];
  updateVerificationStatus: (userId: string, status: 'Approved' | 'Rejected') => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const ADJECTIVES = ['Silent', 'Hopeful', 'Golden', 'Brave', 'Kind', 'Guiding', 'Gentle', 'First', 'Last', 'Shining'];
const NOUNS = ['Star', 'Echo', 'River', 'Guardian', 'Light', 'Flower', 'Stone', 'Heart', 'Voice', 'Hand'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('michyUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('michyUser');
    }
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
    localStorage.setItem('mitcheUsers', JSON.stringify(users));
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const users = getUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      localStorage.setItem('michyUser', JSON.stringify(foundUser));
      setUser(foundUser);
      return { success: true };
    }
    
    return { success: false, message: i18n.t('auth.errorInvalid') };
  };

  const signup = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const users = getUsers();
    
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: i18n.t('auth.errorExists') };
    }

    let userRole: Role = Role.Citizen;
    let verificationStatus: VerificationStatus = 'NotRequested';
    
    if (username.toUpperCase().includes('NGO')) {
        userRole = Role.NGO;
        verificationStatus = 'Pending';
    } else if (username.toUpperCase().includes('GOV')) {
        userRole = Role.PublicWorker;
        verificationStatus = 'Pending';
    } else if (username.toUpperCase().includes('ADMIN')) {
        userRole = Role.Admin;
        verificationStatus = 'Approved'; 
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      password, // Storing plain text for demo purposes only
      symbolicName: '',
      symbolicIcon: '',
      role: userRole,
      hopePoints: 0,
      hopePointsBreakdown: {},
      hasCompletedOnboarding: false,
      isVerified: userRole === Role.Admin, // Admins are auto-verified
      verificationStatus: verificationStatus,
    };

    users.push(newUser);
    saveUsers(users);

    return login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('michyUser');
    setUser(null);
  };

  const updateUserState = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('michyUser', JSON.stringify(updatedUser));

      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          saveUsers(users);
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

  const updateUser = (updatedUserData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedUserData };
    updateUserState(updatedUser as User);
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

    while (generatedUsernames.size < 5) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = Math.floor(100 + Math.random() * 900); // 3-digit number
      const newUsername = `${adj}${noun}_${num}`;
      
      if (!existingUsernames.has(newUsername.toLowerCase())) {
        generatedUsernames.add(newUsername);
      }
    }

    return Array.from(generatedUsernames);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, addHopePoints, updateUser, getUserById, updateAnyUser, getAllUsers, generateUniqueUsernames, updateVerificationStatus }}>
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