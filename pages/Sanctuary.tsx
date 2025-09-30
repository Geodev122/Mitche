import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, BookOpen, Star } from 'lucide-react';

const Sanctuary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navTiles = [
    { title: 'جدار الصدى', subtitle: 'اطلب أو استجب للنداءات', path: '/echoes', icon: MessageSquare },
    { title: 'عطاياك', subtitle: 'شاهد أثر عطائك', path: '/offerings', icon: Heart },
    { title: 'نسيج الأمل', subtitle: 'اقرأ قصص الصمود', path: '/tapestry', icon: BookOpen },
    { title: 'كوكبتك', subtitle: 'سجل الأمل الخاص بك', path: '/constellation', icon: Star },
  ];

  return (
    <div className="p-6">
      <header className="text-center my-8">
        <h1 className="text-2xl text-gray-700">أهلاً بك، <span className="font-bold text-[#D4AF37]">{user?.symbolicName}</span></h1>
        <p className="text-md text-gray-500 mt-2">"ليكن نورك صدى في هذا العالم"</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navTiles.map((tile) => (
          <div 
            key={tile.path} 
            onClick={() => navigate(tile.path)} 
            className="bg-white rounded-xl shadow-sm border border-[#F1EADF] p-6 flex items-center space-x-4 space-x-reverse cursor-pointer hover:shadow-md hover:border-[#D4AF37] transition-all duration-300"
          >
            <div className="bg-[#FBF9F4] p-4 rounded-full">
                <tile.icon className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-800">{tile.title}</h2>
              <p className="text-sm text-gray-500">{tile.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sanctuary;