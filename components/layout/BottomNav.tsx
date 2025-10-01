import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Home, MessageSquare, Calendar, BookOpen, Shield, Trophy, PackageSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home, roles: [Role.Citizen, Role.NGO, Role.PublicWorker, Role.Admin] },
    { path: '/echoes', label: t('nav.echoes'), icon: MessageSquare, roles: [Role.Citizen, Role.NGO, Role.PublicWorker, Role.Admin] },
    { path: '/resources', label: t('nav.resources'), icon: PackageSearch, roles: [Role.Citizen, Role.NGO, Role.PublicWorker, Role.Admin] },
    { path: '/events', label: t('nav.events'), icon: Calendar, roles: [Role.Citizen, Role.NGO, Role.PublicWorker, Role.Admin] },
    { path: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy, roles: [Role.Citizen, Role.NGO, Role.PublicWorker, Role.Admin] },
    { path: '/tapestry', label: t('nav.tapestry'), icon: BookOpen, roles: [Role.Citizen, Role.NGO, Role.PublicWorker, Role.Admin] },
    { path: '/admin', label: t('nav.admin'), icon: Shield, roles: [Role.Admin] },
  ];
  
  const accessibleNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#FFFDF9] border-t border-[#EAE2D6] shadow-md z-10">
      <div className="flex justify-around max-w-lg mx-auto">
        {accessibleNavItems.map(({ path, label, icon: Icon }) => (
          <ReactRouterDOM.NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full py-3 transition-colors duration-300 ${
                isActive 
                  ? 'text-amber-700 bg-amber-100 font-semibold' 
                  : 'text-gray-500 hover:text-amber-600'
              }`
            }
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{label}</span>
          </ReactRouterDOM.NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;