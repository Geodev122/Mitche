import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Role, HopePointCategory } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, password: string, symbolicName: string, symbolicIcon: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addHopePoints: (points: number, category: HopePointCategory) => void;
  updateUser: (updatedUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
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
    
    return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' };
  };

  const signup = async (username: string, password: string, symbolicName: string, symbolicIcon: string): Promise<{ success: boolean; message?: string }> => {
    const users = getUsers();
    
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'اسم المستخدم موجود بالفعل.' };
    }

    // For demo, assign role based on username
    let userRole: Role = Role.Citizen;
    if (username.toUpperCase().includes('NGO')) {
        userRole = Role.NGO;
    } else if (username.toUpperCase().includes('GOV')) {
        userRole = Role.PublicWorker;
    } else if (username.toUpperCase().includes('ADMIN')) {
        userRole = Role.Admin;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      password, // Storing plain text for demo purposes only
      symbolicName,
      symbolicIcon,
      role: userRole,
      hopePoints: 0,
      hopePointsBreakdown: {},
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

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, addHopePoints, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};