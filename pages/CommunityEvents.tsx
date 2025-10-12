import * as React from 'react';
import { useData } from '../context/DataContext';
import { PlusCircle, Users, ShieldCheck, Star } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { CommunityEvent, Role } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';
import { useAuth } from '../context/AuthContext';
import { useRatingModal } from '../context/RatingModalContext';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../utils/time';
import PageContainer from '../components/layout/PageContainer';
import Button from '../design-system/Button';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';

const typeStyles: { [key: string]: { text: string, classes: string } } = {
  Volunteer: { text: 'Volunteer', classes: 'bg-green-100 text-green-800' },
  Event: { text: 'Event', classes: 'bg-blue-100 text-blue-800' },
};

const EventCard: React.FC<{ event: CommunityEvent }> = ({ event }) => {
  const { t } = useTranslation();
  const { openRatingModal } = useRatingModal();

  if (!event) {
    return null;
  }

  const currentTypeStyle = typeStyles[event.type as string];

  return (
    <Card className="mb-4 transition-transform transform hover:scale-[1.02] relative">
      <ReactRouterDOM.Link to={`/events/${event.id}`} className="block p-4">
        <div className="flex items-start">
          <div className="mr-4 rtl:mr-0 rtl:ml-4 flex-shrink-0">
            <div className="w-12 h-12 bg-[#F1EADF] rounded-full flex items-center justify-center">
              <SymbolIcon name={event.organizerSymbolicIcon} className="w-7 h-7 text-[#D4AF37]" />
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800">{event.organizerSymbolicName}</h3>
                {event.organizerIsVerified && <ShieldCheck className="w-4 h-4 text-blue-500" aria-label={t('verifiedOrg') as string} />}
              </div>
              <span className="text-xs text-gray-400">{timeSince(event.timestamp, t)}</span>
            </div>
            <span className="text-sm font-semibold text-gray-500">{t(`roles.${event.organizerRole}`)} - {event.region}</span>
            <h4 className="font-bold text-lg text-gray-800 mt-2">{event.title}</h4>
            <p className="text-gray-600 mt-1 text-md line-clamp-2">{event.description}</p>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className={`text-xs ${currentTypeStyle.classes} px-2 py-1 rounded-full font-semibold`}>{t(`communityEventTypes.${event.type}`)}</div>
          {event.rating && (
            <div className="flex items-center gap-1 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{event.rating.average ? event.rating.average.toFixed(1) : '-'}</span>
              <span className="text-xs text-gray-400">({event.rating.count || 0})</span>
            </div>
          )}
        </div>
      </ReactRouterDOM.Link>
      <div className="absolute bottom-2 right-2 p-1 rounded-full hover:bg-gray-100">
        <Star className="w-5 h-5 text-amber-400 cursor-pointer" onClick={(e) => { e.stopPropagation(); openRatingModal({ id: event.id, type: 'event', name: event.title }); }} />
      </div>
    </Card>
  );
};

const EventCardSkeleton: React.FC = () => (
  <Card className="mb-4">
    <div className="flex items-start">
      <div className="ml-4 rtl:mr-0 rtl:ml-4 flex-shrink-0">
        <div className="w-12 h-12 bg-[#F1EADF] rounded-full flex items-center justify-center animate-pulse">
        </div>
      </div>
      <div className="flex-grow space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-2/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse mt-2" />
        <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </Card>
);

const CommunityEvents: React.FC = () => {
  const { communityEvents, loading } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();

  const canCreateEvent = user && [Role.NGO, Role.PublicWorker, Role.Admin].includes(user.role);

  return (
    <PageContainer>
      <PageHeader
        icon={Users}
        title={t('events.title')}
        subtitle={t('events.subtitle')}
      />

      {loading ? (
        <div className="mt-6">
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      ) : communityEvents.length > 0 ? (
        <div className="mt-6 space-y-4">
          {communityEvents.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-semibold">{t('events.emptyTitle')}</p>
          <p className="text-sm">{t('events.emptySubtitle')}</p>
        </div>
      )}

      {canCreateEvent && (
        <ReactRouterDOM.Link to="/events/new" className="fixed bottom-24 right-6 rtl:right-auto rtl:left-6">
          <Button size="lg" className="shadow-lg">
            <PlusCircle size={20} className="mr-2" /> {t('events.create')}
          </Button>
        </ReactRouterDOM.Link>
      )}
    </PageContainer>
  );
};

export default CommunityEvents;