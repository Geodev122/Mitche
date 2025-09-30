
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Role, HopePointCategory } from '../types';

interface AuthContextType {
  user: User | null;
  login: (idNumber: string, symbolicName: string, symbolicIcon: string) => void;
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
        const parsedUser = JSON.parse(storedUser);
        // Ensure old users have the new structure
        if (!parsedUser.hopePointsBreakdown) {
          parsedUser.hopePointsBreakdown = {};
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('michyUser');
    }
  }, []);

  const login = (idNumber: string, symbolicName: string, symbolicIcon: string) => {
    // In a real app, idNumber would be verified and role would come from the server.
    // For demonstration, we'll assign roles based on the ID number string.
    let userRole: Role = Role.Citizen;
    if (idNumber.toUpperCase().includes('NGO')) {
        userRole = Role.NGO;
    } else if (idNumber.toUpperCase().includes('GOV')) {
        userRole = Role.PublicWorker;
    } else if (idNumber.toUpperCase().includes('ADMIN')) {
        userRole = Role.Admin;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      symbolicName,
      symbolicIcon,
      role: userRole,
      hopePoints: 0,
      hopePointsBreakdown: {},
    };
    
    // Add welcome points for new users
    newUser.hopePoints = 5;
    newUser.hopePointsBreakdown = {
      [HopePointCategory.CommunityBuilder]: 5
    };
    
    localStorage.setItem('michyUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('michyUser');
    setUser(null);
  };

  const addHopePoints = (points: number, category: HopePointCategory) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = {
        ...currentUser,
        hopePoints: currentUser.hopePoints + points,
        hopePointsBreakdown: {
          ...currentUser.hopePointsBreakdown,
          [category]: (currentUser.hopePointsBreakdown[category] || 0) + points,
        }
      };
      localStorage.setItem('michyUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const updateUser = (updatedUserData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = { ...currentUser, ...updatedUserData };
      localStorage.setItem('michyUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, addHopePoints, updateUser }}>
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
