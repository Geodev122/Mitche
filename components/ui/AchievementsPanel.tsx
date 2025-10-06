import React from 'react';
import Card from './Card';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';

const AchievementsPanel: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!user) return;
    // Listen to userAchievements collection for this user
    const q = query(collection(db, 'userAchievements'), where('userId', '==', user.id), orderBy('completedAt', 'desc')) as any;
    const unsub = onSnapshot(q, async (snap: any) => {
      const docs = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
      // Enrich with achievement metadata
      const enriched = await Promise.all(docs.map(async (d: any) => {
        try {
          const achSnap = await getDoc(doc(db, 'achievements', d.achievementId) as any);
          const meta = achSnap.exists() ? (achSnap.data() as any) : null;
          return { ...d, meta };
        } catch (err) {
          return d;
        }
      }));
      setItems(enriched);
    });

    return () => unsub();
  }, [user]);

  if (!user) return null;

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-3">Achievements</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No achievements yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map(it => (
            <div key={it.id} className="flex items-center gap-3 p-2 bg-white rounded border">
              {it.meta?.iconUrl ? <img src={it.meta.iconUrl} alt={it.meta?.title || it.achievementId} className="w-10 h-10 rounded" /> : <div className="w-10 h-10 rounded bg-amber-50 flex items-center justify-center text-amber-600">🏅</div>}
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{it.meta?.title || it.achievementId}</div>
                <div className="text-xs text-gray-500 truncate">{it.meta?.description || ''}</div>
              </div>
              <div className="ml-auto text-xs text-gray-400">{it.completedAt && it.completedAt.toDate ? it.completedAt.toDate().toLocaleString() : (it.completedAt || '')}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AchievementsPanel;
