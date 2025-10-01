import React from 'react';
import { useAuth } from '../context/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { MessageSquare, Calendar, BookOpen, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sanctuary: React.FC = () => {
  const { user } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const { t } = useTranslation();

  const navTiles = [
    { title: t('sanctuary.tiles.echoes'), subtitle: t('sanctuary.tiles.echoesSub'), path: '/echoes', icon: MessageSquare },
    { title: t('sanctuary.tiles.events'), subtitle: t('sanctuary.tiles.eventsSub'), path: '/events', icon: Calendar },
    { title: t('sanctuary.tiles.tapestry'), subtitle: t('sanctuary.tiles.tapestrySub'), path: '/tapestry', icon: BookOpen },
    { title: t('sanctuary.tiles.constellation'), subtitle: t('sanctuary.tiles.constellationSub'), path: '/constellation', icon: Star },
  ];

  return (
    <div className="p-4 pb-24">
      <header className="text-center my-8">
        <h1 className="text-2xl text-gray-700">{t('sanctuary.welcome', { name: user?.symbolicName })}</h1>
        <p className="text-md text-gray-500 mt-2">"{t('sanctuary.quote')}"</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navTiles.map((tile) => (
          <div 
            key={tile.path} 
            onClick={() => navigate(tile.path)} 
            className="bg-white rounded-xl shadow-sm border border-[#F1EADF] p-6 flex items-center space-x-4 rtl:space-x-reverse cursor-pointer hover:shadow-md hover:border-[#D4AF37] active:scale-95 transition-all duration-300"
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
