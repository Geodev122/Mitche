import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';
// Lazy-load firebase and enhanced service to keep SDK out of the main bundle
let _db_cached: any = null;
async function getDb() {
  if (_db_cached) return _db_cached;
  const m = await import('../services/firebase');
  _db_cached = m.db;
  return _db_cached;
}

let _efs_cached: any = null;
async function getEnhancedFs() {
  if (_efs_cached) return _efs_cached;
  const m = await import('../services/firebase-enhanced');
  _efs_cached = m.enhancedFirebaseService;
  return _efs_cached;
}
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [startDate, setStartDate] = React.useState<string>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState<string>(() => new Date().toISOString().split('T')[0]);
  const [daily, setDaily] = React.useState<Record<string, { card_impression: number; star_clicked: number }>>({});

  const loadSummary = React.useCallback(async (start: string, end: string) => {
    if (!user) return;
    setLoading(true);
    try {
  const efs = await getEnhancedFs();
  const res = await efs.getAnalyticsSummary(start, end);
      if (res.success) setSummary(res.data);

      // Also fetch raw analytics docs for daily breakdown
  const dbRef = await getDb();
  const analyticsRef = collection(dbRef, 'analytics');
      const q = query(analyticsRef, where('date', '>=', start), where('date', '<=', end), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      const dailyAgg: Record<string, { card_impression: number; star_clicked: number }> = {};
      snap.docs.forEach(d => {
        const doc = d.data() as any;
        const date = doc.date as string;
        if (!dailyAgg[date]) dailyAgg[date] = { card_impression: 0, star_clicked: 0 };
        if (doc.eventType === 'card_impression') dailyAgg[date].card_impression += 1;
        if (doc.eventType === 'star_clicked') dailyAgg[date].star_clicked += 1;
      });
      setDaily(dailyAgg);
    } catch (err) {
      console.error('Error loading analytics summary', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (!user || [Role.Citizen].includes(user.role)) return;
    loadSummary(startDate, endDate);
  }, [user, startDate, endDate, loadSummary]);

  if (!user) return null;
  if ([Role.Citizen].includes(user.role)) return <div className="p-4">Access denied</div>;

  return (
    <div className="p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('analytics.title', 'Platform Analytics')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('analytics.subtitle', 'Engagement and event tracking')}</p>
      </header>

      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Start</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border rounded" />
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <label className="text-sm text-gray-600">End</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border rounded" />
          </div>
          <div className="mt-2 md:mt-0">
            <button onClick={() => loadSummary(startDate, endDate)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Load</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          <Card>
            <h3 className="font-semibold mb-3">Daily Breakdown</h3>
            <div className="w-full h-48">
              <DailyBarChart data={daily} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

const DailyBarChart: React.FC<{ data: Record<string, { card_impression: number; star_clicked: number }> }> = ({ data }) => {
  const dates = Object.keys(data).sort();
  if (dates.length === 0) return <div className="text-sm text-gray-500">No data for selected range</div>;

  const maxVal = Math.max(...dates.map(d => Math.max(data[d].card_impression, data[d].star_clicked, 0)), 1);
  const barWidth = Math.floor(100 / dates.length);

  return (
    <svg viewBox={`0 0 100 50`} className="w-full h-full">
      {dates.map((date, i) => {
        const x = i * barWidth;
        const cardH = (data[date].card_impression / maxVal) * 40;
        const starH = (data[date].star_clicked / maxVal) * 40;
        return (
          <g key={date} transform={`translate(${x},0)` }>
            <rect x={2} y={45 - cardH} width={barWidth - 6} height={cardH} fill="#D4AF37" opacity={0.9} />
            <rect x={2} y={45 - cardH - starH - 1} width={barWidth - 6} height={starH} fill="#3A3A3A" opacity={0.9} />
            <text x={barWidth / 2} y={49} fontSize={3} fill="#666" textAnchor="middle">{date.slice(5)}</text>
          </g>
        );
      })}
    </svg>
  );
};

export default AnalyticsDashboard;
