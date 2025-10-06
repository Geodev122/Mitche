import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import SymbolIcon from '../components/ui/SymbolIcon';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';
import { RatingSystem } from '../components/rating/RatingSystem';
import { doc as docRef, getDoc } from 'firebase/firestore';
let _db_lazy_event: any = null;
async function getDbEvent() {
  if (_db_lazy_event) return _db_lazy_event;
  const m = await import('../services/firebase');
  _db_lazy_event = m.db;
  return _db_lazy_event;
}

const CommunityEventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { communityEvents } = useData();
  const { enhancedFirebase } = useAuth();
  const { t } = useTranslation();
  const [event, setEvent] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const local = communityEvents.find(e => e.id === eventId);
    if (local) {
      setEvent(local);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        if (!eventId) {
          if (mounted) setEvent(null);
          return;
        }
  const dbInst = await getDbEvent();
  const snap = await getDoc(docRef(dbInst, 'communityEvents', eventId));
        if (mounted) {
          if (snap.exists()) setEvent({ id: snap.id, ...(snap.data() as any) });
          else setEvent(null);
        }
      } catch (e) {
        console.error('Failed to load event', e);
        if (mounted) setEvent(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [eventId, communityEvents]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!event) return <div className="p-4">Event not found</div>;

  return (
    <div className="p-4 pb-24">
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-[#F1EADF] rounded-full flex items-center justify-center">
            <SymbolIcon name={event.organizerSymbolicIcon} className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              {event.organizerIsVerified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
            </div>
            <div className="text-sm text-gray-500">{event.region} • {timeSince(event.timestamp, t)}</div>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{event.description}</p>

            <div className="mt-6">
              <RatingSystem
                targetId={event.id}
                targetType="event"
                targetName={event.title}
                currentRating={event.rating}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommunityEventDetail;
