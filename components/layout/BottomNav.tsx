
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Heart, Star, BookOpen } from 'lucide-react';

const navItems = [
  { path: '/', label: 'الملاذ', icon: Home },
  { path: '/echoes', label: 'صدى', icon: MessageSquare },
  { path: '/offerings', label: 'عطاء', icon: Heart },
  { path: '/constellation', label: 'كوكبة', icon: Star },
  { path: '/tapestry', label: 'نسيج الأمل', icon: BookOpen },
];

const BottomNav: React.FC = () => {
  const activeLinkStyle = {
    color: '#D4AF37', // A gold-like color for active state
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#FFFDF9] border-t border-[#EAE2D6] shadow-md z-10">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className="flex flex-col items-center justify-center w-full py-2 text-[#7F7B74] hover:text-[#D4AF37] transition-colors duration-300"
            style={({ isActive }) => (isActive ? activeLinkStyle : {})}
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
