import * as React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { MessageSquare, Calendar, BookOpen, Star, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TapestryPreview from '../../components/tapestry/TapestryPreview';
import { RatingSystem } from '../../components/rating/RatingSystem';
import DailyRitual from '../../components/ui/DailyRitual';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';

const NavTile: React.FC<{ title: string; subtitle: string; path: string; icon: React.ElementType }> = ({ title, subtitle, path, icon: Icon }) => {
    const navigate = useNavigate();
    return (
        <Card 
            onClick={() => navigate(path)} 
            className="flex items-center gap-6 p-6 cursor-pointer hover:shadow-lg hover:border-amber-400 transition-all duration-300 group"
        >
            <div className="bg-amber-50 p-4 rounded-full group-hover:bg-amber-100 transition-colors">
                <Icon className="w-8 h-8 text-amber-500" />
            </div>
            <div>
                <h2 className="font-bold text-lg text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
        </Card>
    );
};

const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  const navTiles = [
    { title: t('sanctuary.tiles.echoes'), subtitle: t('sanctuary.tiles.echoesSub'), path: '/echoes', icon: MessageSquare },
    { title: t('sanctuary.tiles.events'), subtitle: t('sanctuary.tiles.eventsSub'), path: '/events', icon: Calendar },
    { title: t('sanctuary.tiles.tapestry'), subtitle: t('sanctuary.tiles.tapestrySub'), path: '/tapestry', icon: BookOpen },
  ];

  return (
    <PageContainer>
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.citizen.title', 'Sanctuary')}</h1>
      </div>
      <div className="p-4 md:p-6">
          <header className="text-center my-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {t('sanctuary.welcome', { name: user?.symbolicName || 'Friend' })}
            </h1>
            <p className="text-md text-gray-500 mt-2 max-w-2xl mx-auto">"{t('sanctuary.quote')}"</p>
          </header>

          <div className="mb-8">
            <TapestryPreview />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {navTiles.map((tile) => (
              <NavTile key={tile.path} {...tile} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-full"><Star className="w-5 h-5 text-gray-600" /></div>
                    <h3 className="font-semibold text-lg text-gray-800">{t('dashboard.ratingExample.title')}</h3>
                </div>
                <RatingSystem
                    targetId="sample-user-1"
                    targetType="user"
                    targetName="Community Helper"
                    currentRating={{ average: 4.6, count: 21 }}
                    showReviewForm={true}
                />
            </Card>

            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-full"><Sun className="w-5 h-5 text-gray-600" /></div>
                    <h3 className="font-semibold text-lg text-gray-800">{t('dashboard.dailyRitual.title')}</h3>
                </div>
                <DailyRitual />
            </Card>
          </div>
      </div>
    </PageContainer>
  );
};

export default CitizenDashboard;