import * as React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PlusSquare, BookOpen, Award, Trophy, Users, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ConstellationFlower from '../../components/ui/ConstellationFlower';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../design-system/Button';

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number; onClick?: () => void }> = ({ icon: Icon, label, value, onClick }) => (
    <div 
        onClick={onClick} 
        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
    >
        <div className="p-3 bg-amber-50 rounded-full mb-2">
            <Icon className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
    </div>
);

const QuickActionCard: React.FC<{ icon: React.ElementType; title: string; subtitle: string; onClick: () => void; }> = ({ icon: Icon, title, subtitle, onClick }) => (
    <Card onClick={onClick} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="p-3 bg-gray-100 rounded-full">
            <Icon className="w-6 h-6 text-gray-600" />
        </div>
        <div>
            <p className="font-bold text-gray-800">{title}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    </Card>
);


const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { getRecentActivityForUser, requests, communityEvents, tapestryThreads } = useData();
  const dataCtx = useData();
  const navigate = useNavigate();

  const [recent, setRecent] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await getRecentActivityForUser(user?.id);
        if (!mounted) return;
        setRecent(Array.isArray(r) ? r : []);
      } catch (e) {
        setRecent([]);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id, getRecentActivityForUser]);

  // Live pillars subscription for Constellation
  const [pillars, setPillars] = React.useState<any>({});
  React.useEffect(() => {
    if (!user) return;
    let unsub: () => void = () => {};
    if (dataCtx && typeof dataCtx.subscribeToUserPillars === 'function') {
      unsub = dataCtx.subscribeToUserPillars(user.id, (p: any) => setPillars(p || {}));
    } else {
      setPillars((user as any)?.pillars || (user as any)?.hopePointsBreakdown || {});
    }
    return () => { try { unsub(); } catch (e) {} };
  }, [user?.id, dataCtx]);

  const userBadges = user?.badges || [];

  return (
    <PageContainer>
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.welcome', { name: user?.displayName || user?.symbolicName || '' })}</h1>
            <p className="text-md text-gray-500 mt-1">{t('dashboard.mobileIntro')}</p>
        </div>

        <div className="px-4">
            <Card className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-400 to-yellow-500 text-white">
                <div>
                    <p className="text-sm opacity-90">{t('dashboard.yourConstellation')}</p>
                    <p className="text-lg font-bold">{t('dashboard.viewYourGrowth')}</p>
                    <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate('/constellation')}>
                        {t('constellation.title')}
                    </Button>
                </div>
                <div className="w-24 h-24">
                    <ConstellationFlower pillars={pillars} size={96} />
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-4 gap-3 p-4">
            <StatCard icon={Award} label={t('achievements.title')} value={userBadges.length} onClick={() => navigate('/achievements')} />
            <StatCard icon={Trophy} label={t('leaderboard.title')} value={user?.hopePoints || 0} onClick={() => navigate('/leaderboard')} />
            <StatCard icon={BookOpen} label={t('tapestry.title')} value={tapestryThreads.length} onClick={() => navigate('/tapestry')} />
            <StatCard icon={Users} label={t('events.title')} value={communityEvents.length} onClick={() => navigate('/events')} />
        </div>

        <div className="px-4 mt-2">
            <h2 className="text-xl font-bold text-gray-800 mb-3">{t('dashboard.quickActions')}</h2>
            <div className="space-y-3">
                <QuickActionCard 
                    icon={PlusSquare}
                    title={t('createRequest.title')}
                    subtitle={t('createRequest.subtitle')}
                    onClick={() => navigate('/echoes/new')}
                />
                <QuickActionCard 
                    icon={BookOpen}
                    title={t('dashboard.ritualTitle')}
                    subtitle={t('dashboard.ritualIntro')}
                    onClick={() => navigate('/ritual')}
                />
            </div>
        </div>

        <div className="px-4 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">{t('dashboard.activity')}</h2>
            <Card className="p-4">
                {recent.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">{t('dashboard.noRecentActivity')}</div>
                ) : (
                <ul className="space-y-3">
                    {recent.slice(0, 5).map((rItem: any, idx: number) => (
                        <li key={rItem.id || idx} className="text-sm text-gray-700 flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Activity className="w-4 h-4 text-gray-500" />
                            </div>
                            <span>{rItem.text || rItem.title || JSON.stringify(rItem)}</span>
                        </li>
                    ))}
                </ul>
                )}
            </Card>
        </div>
    </PageContainer>
  );
};

export default MobileDashboard;
