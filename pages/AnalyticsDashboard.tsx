import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';
import { enhancedFirebaseService } from '../services/firebase-enhanced';

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user || [Role.Citizen].includes(user.role)) return;
    (async () => {
      setLoading(true);
      try {
        // Simple server-side summary helper if available
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date().toISOString().split('T')[0];
        const res = await enhancedFirebaseService.getAnalyticsSummary(start, end);
        if (res.success) setSummary(res.data);
      } catch (err) {
        console.error('Error loading analytics summary', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return null;
  if ([Role.Citizen].includes(user.role)) return <div className="p-4">Access denied</div>;

  return (
    <div className="p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('analytics.title', 'Platform Analytics')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('analytics.subtitle', 'Engagement and event tracking')}</p>
      </header>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <h3 className="font-semibold">Total Events</h3>
            <p className="text-2xl font-bold mt-2">{summary?.totalEvents ?? 0}</p>
          </Card>
          <Card>
            <h3 className="font-semibold">Card Impressions</h3>
            <p className="text-2xl font-bold mt-2">{summary?.eventsByType?.card_impression ?? 0}</p>
          </Card>
          <Card>
            <h3 className="font-semibold">Star Clicks</h3>
            <p className="text-2xl font-bold mt-2">{summary?.eventsByType?.star_clicked ?? 0}</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
