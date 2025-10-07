import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import ResponsiveLogo from '../../components/ui/ResponsiveLogo';
import { PlusSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { getQuickActionsForUser, getRecentActivityForUser } = useData();
  const navigate = useNavigate();

  const [quickActions, setQuickActions] = React.useState<any[]>([]);
  const [recent, setRecent] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const qa = await getQuickActionsForUser(user?.id);
        const r = await getRecentActivityForUser(user?.id);
        if (!mounted) return;
        setQuickActions(Array.isArray(qa) ? qa : []);
        setRecent(Array.isArray(r) ? r : []);
      } catch (e) {
        setQuickActions([]);
        setRecent([]);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-white p-4">
      <header className="flex items-center justify-between">
        <ResponsiveLogo className="w-12 h-12" />
        <div className="flex items-center gap-2">
          {/* Notification icon removed because it was non-functional */}
          <button
            aria-label="create-request"
            title={t('createRequest.title')}
            onClick={() => navigate('/echoes/new')}
            className="p-2 rounded-md bg-[#D4AF37] text-white"
          >
            <PlusSquare className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="mt-6">
        <h2 className="text-xl font-bold">{t('dashboard.welcome', { name: user?.symbolicName || '' })}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('dashboard.mobileIntro')}</p>

        <section className="mt-4 grid grid-cols-1 gap-3">
          <div className="p-3 bg-[#FBF9F4] rounded-lg">
            <h3 className="font-semibold mb-2">{t('dashboard.quickActions')}</h3>
            {quickActions.length === 0 ? (
              <p className="text-sm text-gray-500">{t('dashboard.noQuickActions') || t('dashboard.quickActions')}</p>
            ) : (
              <ul className="space-y-2">
                {quickActions.map((q: any) => (
                  <li key={q.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{q.title || q.label}</div>
                      <div className="text-xs text-gray-500">{q.subtitle || ''}</div>
                    </div>
                    <div>
                      {q.action === 'createRequest' ? (
                        <button onClick={() => navigate('/echoes/new')} className="text-xs text-[#D4AF37]">{t('createRequest.title')}</button>
                      ) : (
                        <button onClick={() => q.onClick && q.onClick()} className="text-xs text-[#D4AF37]">{t('common.open')}</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 bg-[#FBF9F4] rounded-lg">
            <h3 className="font-semibold mb-2">{t('dashboard.recent')}</h3>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-500">{t('constellation.activity.noActivity') || t('dashboard.recent')}</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((rItem: any, idx: number) => (
                  <li key={rItem.id || idx} className="text-sm text-gray-700">{rItem.text || rItem.title || JSON.stringify(rItem)}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MobileDashboard;
