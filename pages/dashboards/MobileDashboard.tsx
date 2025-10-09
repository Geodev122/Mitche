import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import ResponsiveLogo from '../../components/ui/ResponsiveLogo';
import { PlusSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ConstellationFlower from '../../components/ui/ConstellationFlower';
import Button from '../../components/ui/Button';

const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { getQuickActionsForUser, getRecentActivityForUser } = useData();
  const dataCtx = useData();
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
  }, [user?.id]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between mb-4">
        <ResponsiveLogo className="w-12 h-12" />
        <div className="flex items-center gap-2">
          <button aria-label="create-request" title={t('createRequest.title')} onClick={() => navigate('/echoes/new')} className="p-2 rounded-md bg-[var(--accent)] text-white">
            <PlusSquare className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid-3">
        {/* Left sidebar */}
        <aside className="card sidebar-profile">
          <div className="text-sm font-semibold">{user?.symbolicName || user?.username}</div>
          <div className="text-xs text-gray-500 mt-1">{user?.role}</div>
          {/* Placeholder for more profile stats */}
        </aside>

        {/* Center: main feed */}
        <main>
          <h2 className="text-xl font-bold">{t('dashboard.welcome', { name: user?.symbolicName || '' })}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.mobileIntro')}</p>

          <section className="mt-4 space-y-4">
            <div className="card">
              <h3 className="font-semibold mb-2">{t('dashboard.activity')}</h3>
              {recent.length === 0 ? (
                <div className="text-sm text-gray-500">{t('constellation.activity.noActivity') || t('dashboard.recent')}</div>
              ) : (
                <ul className="space-y-2">
                  {recent.map((rItem: any, idx: number) => (
                    <li key={rItem.id || idx} className="text-sm text-gray-700">{rItem.text || rItem.title || JSON.stringify(rItem)}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* other center widgets can be added here */}
          </section>
        </main>

        {/* Right: quick actions + ritual hero */}
        <aside>
          <div className="card right-hero mb-4">
            <h3 className="font-semibold mb-2">{t('dashboard.quickActions')}</h3>
            {quickActions.length === 0 ? (
              <div className="text-sm text-gray-500">{t('dashboard.noQuickActions')}</div>
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
                        <button onClick={() => navigate('/echoes/new')} className="text-xs text-[var(--accent)]">{t('createRequest.title')}</button>
                      ) : (
                        <button onClick={() => q.onClick && q.onClick()} className="text-xs text-[var(--accent)]">{t('common.open')}</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card right-hero">
            <h3 className="font-semibold mb-2">Daily Ritual</h3>
            <p className="text-sm text-gray-600">{t('dashboard.ritualIntro') || 'Complete your daily ritual to earn hope points.'}</p>
            <div className="mt-3">
              <a href="/ritual" className="inline-block px-3 py-2 rounded-md bg-[var(--accent)] text-white">Start Ritual</a>
            </div>
          </div>
          <div className="card right-hero mt-4">
            <h3 className="font-semibold mb-2">{t('constellation.title') || 'Constellation'}</h3>
            <div className="flex items-center justify-center">
              <ConstellationFlower pillars={pillars} size={140} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MobileDashboard;
