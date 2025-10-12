import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SymbolIcon from '../components/ui/SymbolIcon';
import { ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';
import { RatingSystem } from '../components/rating/RatingSystem';
import { doc as docRef, getDoc } from 'firebase/firestore';
import PageContainer from '../components/layout/PageContainer';
import { CommunityEvent } from '../types';
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [event, setEvent] = React.useState<CommunityEvent | null>(null);
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

  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowLeft;

  if (loading) return <div className="p-4 text-center">{t('common.loading')}</div>;
  if (!event) return <div className="p-4 text-center">{t('events.notFound')}</div>;

  return (
    <PageContainer>
      <header className="flex items-center my-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <BackArrow size={24} className="text-gray-700" />
        </button>
        <div className="w-10 h-10 bg-[#F1EADF] rounded-full flex items-center justify-center ml-2">
          <SymbolIcon name={event.organizerSymbolicIcon} className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div className="ml-3">
          <h1 className="text-xl font-bold text-gray-800 truncate">{event.title}</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{event.organizerSymbolicName}</span>
            {event.organizerIsVerified && <ShieldCheck className="w-3 h-3 text-blue-500" />}
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-semibold text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded-md">
            {t(`communityEventTypes.${event.type}`)}
          </div>
          <p className="text-xs text-gray-400">{timeSince(event.timestamp, t)}</p>
        </div>
        
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{event.description}</p>

        <div className="border-t border-gray-100 pt-4">
          <p className="font-semibold text-gray-500 text-sm mb-2">{t('events.region')}</p>
          <p className="text-gray-800">{event.region}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">{t('rating.title')}</h2>
        <RatingSystem
          targetId={event.id}
          targetType="event"
          targetName={event.title}
          currentRating={event.rating}
        />
      </div>
    </PageContainer>
  );
};

export default CommunityEventDetail;
