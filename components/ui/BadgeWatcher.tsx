import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';

const BadgeWatcher: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const prevBadgesRef = React.useRef<string[] | null>(null);

  React.useEffect(() => {
    if (!user) {
      prevBadgesRef.current = null;
      return;
    }

    const prev = prevBadgesRef.current || [];
    const now = user.badges || [];
    const newBadges = now.filter(b => !prev.includes(b));

    if (newBadges.length > 0) {
      // For each new badge, fetch achievement metadata and show toast
      (async () => {
        try {
          const { db } = await import('../../services/firebase');
          const { doc, getDoc } = await import('firebase/firestore');
          for (const id of newBadges) {
            try {
              const snap = await getDoc(doc(db, 'achievements', id) as any);
              const meta = snap.exists() ? (snap.data() as any) : null;
              const title = meta?.title || id;
              toast.show(`🏅 ${title} — ${'achievement.unlocked'}`, 'success');
            } catch (err) {
              console.error('Failed to fetch achievement metadata for toast', err);
              toast.show(`🏅 ${id} — unlocked`, 'success');
            }
          }
        } catch (err) {
          console.error('BadgeWatcher error', err);
          // Fallback simple toast
          newBadges.forEach(id => toast.show(`🏅 ${id} — unlocked`, 'success'));
        }
      })();
    }

    prevBadgesRef.current = now.slice();
  }, [user, toast]);

  return null;
};

export default BadgeWatcher;
